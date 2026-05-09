// Solutions for the Coding Challenges category.
// Keyed by template name. The Code Playground exposes a "Show Solution"
// toggle that swaps the challenge code for the solution code below.

export const playgroundSolutions: Record<string, string> = {
  'Two Sum': `// ===== SOLUTION: Two Sum =====
//
// ┌──────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                     │ Time  │ Space │ Verdict   │
// ├──────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Hash map (single pass)    │ O(n)  │ O(n)  │ BEST      │
// │ 2. Hash map (two pass)       │ O(n)  │ O(n)  │ Also good │
// │ 3. Brute force (nested loops)│ O(n²) │ O(1)  │ Don't ship│
// └──────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Hash map, single pass (BEST) -----
// For each n, check if (target - n) was already seen. If yes, done.
// Otherwise record n's index for later lookups. One pass over the array.
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

// ----- Approach 2: Hash map, two passes -----
// First pass builds value→index map; second pass searches for the complement.
// Slightly easier to read but pays for two passes over the array.
function twoSumTwoPass(nums, target) {
  const indexOf = new Map();
  for (let i = 0; i < nums.length; i++) indexOf.set(nums[i], i);
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (indexOf.has(need) && indexOf.get(need) !== i) return [i, indexOf.get(need)];
  }
  return [];
}

// ----- Approach 3: Brute force (DON'T SHIP — interview-only baseline) -----
// Two nested loops: O(n²) time, O(1) space. Useful as the "naive" answer
// you mention before improving to the hash-map approach.
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (hash, single-pass) — BEST ---");
test("Example 1", twoSum([2, 7, 11, 15], 9), [0, 1]);
test("Example 2", twoSum([3, 2, 4], 6), [1, 2]);
test("Example 3", twoSum([3, 3], 6), [0, 1]);

console.log("\\n--- Approach 3 (brute force) — same answers, O(n²) ---");
test("Brute: Example 1", twoSumBrute([2, 7, 11, 15], 9), [0, 1]);

// ===== When to pick which =====
// - Always use Approach 1 in production. The space is O(n) but in
//   interview problems n is small enough that it's strictly faster.
// - Approach 2 is fine if it reads more clearly to you; same complexity.
// - Approach 3 is a teaching tool only — interviewers want to see you
//   recognize that the hash map turns O(n²) into O(n).`,

  'Reverse String': `// ===== SOLUTION: Reverse String =====
//
// ┌────────────────────────────────────┬───────┬───────┬─────────────┐
// │ Approach                           │ Time  │ Space │ Verdict     │
// ├────────────────────────────────────┼───────┼───────┼─────────────┤
// │ 1. Two-pointer in-place (chars)    │ O(n)  │ O(n)  │ BEST        │
// │ 2. split + reverse + join (1-line) │ O(n)  │ O(n)  │ Pragmatic   │
// │ 3. Recursion                       │ O(n)  │ O(n)  │ Stack risk  │
// │ 4. Build with for-loop from end    │ O(n²) │ O(n)  │ Don't ship  │
// └────────────────────────────────────┴───────┴───────┴─────────────┘

// ----- Approach 1: Two-pointer (BEST when avoiding split/join is required) -----
function reverseString(str) {
  const arr = str.split("");
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  return arr.join("");
}

// ----- Approach 2: split + reverse + join (pragmatic 1-liner) -----
// Uses Array.prototype.reverse internally — same complexity, but loses
// "interview points" if the question wanted you to demonstrate the algorithm.
function reverseStringQuick(str) {
  return str.split("").reverse().join("");
}

// ----- Approach 3: Recursion (elegant; risk of stack overflow on huge strings) -----
function reverseStringRecursive(str) {
  if (str.length <= 1) return str;
  return reverseStringRecursive(str.slice(1)) + str[0];
}

// ----- Approach 4: For-loop with string concatenation (DON'T SHIP) -----
// Each += creates a new string; in a loop that's O(n²). Easy to write,
// terrible for performance — useful only as the "naive" baseline.
function reverseStringSlow(str) {
  let out = "";
  for (let i = str.length - 1; i >= 0; i--) out += str[i];
  return out;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (two-pointer) — BEST ---");
test("Simple word", reverseString("hello"), "olleh");
test("Empty string", reverseString(""), "");
test("Palindrome", reverseString("racecar"), "racecar");

console.log("\\n--- Approach 2 (split+reverse+join) ---");
test("Quick: hello", reverseStringQuick("hello"), "olleh");

console.log("\\n--- Approach 3 (recursion) ---");
test("Recursive: hello", reverseStringRecursive("hello"), "olleh");

// ===== When to pick which =====
// - Real code: Approach 2 (split+reverse+join). Idiomatic, native-fast.
// - Interview demonstrating algorithmic thinking: Approach 1 (two-pointer).
// - Stack-safe huge strings (10k+ chars): NOT Approach 3 — V8 stack ~10k.
// - Approach 4 is a teaching baseline; never use in real code.`,

  'Valid Palindrome': `// ===== SOLUTION: Valid Palindrome =====
//
// ┌─────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                            │ Time  │ Space │ Verdict    │
// ├─────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Clean + two-pointer              │ O(n)  │ O(n)  │ BEST clear │
// │ 2. Two-pointer skipping in-place    │ O(n)  │ O(1)  │ BEST space │
// │ 3. Reverse and compare              │ O(n)  │ O(n)  │ Concise    │
// └─────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Clean string + two-pointer (most readable) -----
// Build a normalized copy first, then compare ends inward. Easy to verify.
function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++; right--;
  }
  return true;
}

// ----- Approach 2: Two-pointer skipping in-place (O(1) space) -----
// Walk the original string with two pointers; skip non-alphanumeric on the fly.
// Best when the string is huge and you don't want to allocate a copy.
function isPalindromeInPlace(s) {
  const isAlnum = (c) => /[a-z0-9]/i.test(c);
  let left = 0, right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left]))  left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++; right--;
  }
  return true;
}

// ----- Approach 3: Reverse and compare (1-line readable) -----
// Concise, but allocates two strings. Same time complexity as Approach 1
// with a higher constant factor.
function isPalindromeReverse(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (clean + two-pointer) — most readable ---");
test("Classic palindrome", isPalindrome("A man, a plan, a canal: Panama"), true);
test("Not a palindrome", isPalindrome("race a car"), false);
test("Empty string", isPalindrome(""), true);
test("Single char", isPalindrome("a"), true);
test("With numbers", isPalindrome("0P"), false);

console.log("\\n--- Approach 2 (in-place skipping) — O(1) space ---");
test("In-place: classic", isPalindromeInPlace("A man, a plan, a canal: Panama"), true);

// ===== When to pick which =====
// - Default → Approach 1. Clearest intent, easiest review.
// - Memory-constrained / very long strings → Approach 2.
// - Quick code-golf answer in a non-perf-critical context → Approach 3.`,

  'FizzBuzz': `// ===== SOLUTION: FizzBuzz =====
//
// ┌──────────────────────────────────────┬───────┬───────┬─────────────┐
// │ Approach                             │ Time  │ Space │ Verdict     │
// ├──────────────────────────────────────┼───────┼───────┼─────────────┤
// │ 1. If/else chain (mod 15 first)      │ O(n)  │ O(n)  │ BEST clear  │
// │ 2. String concat trick               │ O(n)  │ O(n)  │ Extensible  │
// │ 3. Lookup table of divisor→label     │ O(n)  │ O(n)  │ Cleanest    │
// └──────────────────────────────────────┴───────┴───────┴─────────────┘

// ----- Approach 1: If/else chain (most common interview answer) -----
// Critical: check 15 BEFORE 3 and 5. If you check 3 first, you'd miss
// FizzBuzz cases (15 is divisible by both, but the first match wins).
function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}

// ----- Approach 2: String concat trick (avoids the "check 15 first" gotcha) -----
// Build the output string by appending Fizz / Buzz independently.
// If neither matched, fall back to the number. Senior interviewers often
// prefer this — no special-cased "15" branch, easier to extend to N rules.
function fizzBuzzConcat(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    let s = "";
    if (i % 3 === 0) s += "Fizz";
    if (i % 5 === 0) s += "Buzz";
    result.push(s || String(i));
  }
  return result;
}

// ----- Approach 3: Lookup table (best for "add Bazz at multiples of 7") -----
// Generalizes to any number of rules. The interviewer's follow-up
// "now add 7 → Bazz" is a one-line config change with this approach.
function fizzBuzzTable(n) {
  const rules = [[3, "Fizz"], [5, "Buzz"]];   // [[7, "Bazz"]] would just slot in
  const result = [];
  for (let i = 1; i <= n; i++) {
    let s = "";
    for (const [divisor, label] of rules) if (i % divisor === 0) s += label;
    result.push(s || String(i));
  }
  return result;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (if/else, 15 first) ---");
test("First 5", fizzBuzz(5), ["1", "2", "Fizz", "4", "Buzz"]);
test("First 15", fizzBuzz(15), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]);
test("Just 1", fizzBuzz(1), ["1"]);
test("FizzBuzz at 30", fizzBuzz(30).slice(-1), ["FizzBuzz"]);

console.log("\\n--- Approach 2 (string concat) — same outputs ---");
test("Concat: First 15", fizzBuzzConcat(15).slice(-1), ["FizzBuzz"]);

console.log("\\n--- Approach 3 (lookup table) — same outputs ---");
test("Table: First 15", fizzBuzzTable(15).slice(-1), ["FizzBuzz"]);

// ===== When to pick which =====
// - Junior whiteboard / quick answer → Approach 1. Trip-wire: must check 15 first.
// - Cleaner abstraction in interview → Approach 2. No order-dependent branch.
// - Anticipating "add a 4th rule" follow-up → Approach 3. Table-driven scales.
//
// Why these are used: FizzBuzz tests basic control flow, modulo arithmetic,
// and the awareness that "first match wins" matters when conditions overlap.`,

  'Max Profit': `// ===== SOLUTION: Max Profit (Best Time to Buy/Sell Stock) =====
//
// ┌────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                           │ Time  │ Space │ Verdict    │
// ├────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Single-pass (track minSoFar)    │ O(n)  │ O(1)  │ BEST       │
// │ 2. Brute force (every pair)        │ O(n²) │ O(1)  │ Don't ship │
// │ 3. Kadane-like running maximum     │ O(n)  │ O(1)  │ Equivalent │
// └────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Single-pass tracking minSoFar (BEST) -----
// Insight: max profit selling on day i = price[i] - min(prices[0..i-1]).
// Track minSoFar as we go; profit candidate is price - minSoFar.
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) minPrice = price;
    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
  }
  return maxProfit;
}

// ----- Approach 2: Brute force (DON'T SHIP — O(n²)) -----
// Try every (buy, sell) pair where sell comes after buy. Useful only as
// the "naive" baseline before showing the single-pass optimization.
function maxProfitBrute(prices) {
  let max = 0;
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      max = Math.max(max, prices[j] - prices[i]);
    }
  }
  return max;
}

// ----- Approach 3: Kadane-like (running maximum of daily diffs) -----
// Frame as "find max sum subarray of daily price differences."
// Equivalent in big-O to Approach 1; some interviewers prefer this framing.
function maxProfitKadane(prices) {
  let cur = 0, max = 0;
  for (let i = 1; i < prices.length; i++) {
    cur = Math.max(0, cur + prices[i] - prices[i - 1]);
    max = Math.max(max, cur);
  }
  return max;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (single-pass minSoFar) — BEST ---");
test("Profit possible", maxProfit([7, 1, 5, 3, 6, 4]), 5);
test("Decreasing only", maxProfit([7, 6, 4, 3, 1]), 0);
test("Single price", maxProfit([5]), 0);
test("Empty", maxProfit([]), 0);
test("Two prices, profit", maxProfit([1, 5]), 4);

console.log("\\n--- Approach 3 (Kadane) — same outputs ---");
test("Kadane: profit", maxProfitKadane([7, 1, 5, 3, 6, 4]), 5);

// ===== When to pick which =====
// - Always Approach 1 in production. Smallest constant factors.
// - Approach 3 is helpful when the interviewer asks "why is this similar
//   to maximum subarray sum?" — answer: it's Kadane on daily diffs.
// - Approach 2 is the "before optimization" baseline.
//
// Why used: this question tests whether you spot the linear-time insight.
// The naive O(n²) is the obvious answer; the senior signal is recognizing
// "I only ever need the minimum to my left, which I can track in one pass."`,

  'Valid Parentheses': `// ===== SOLUTION: Valid Parentheses =====
//
// ┌──────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                             │ Time  │ Space │ Verdict    │
// ├──────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Stack (canonical)                 │ O(n)  │ O(n)  │ BEST       │
// │ 2. Replace empty pairs in loop       │ O(n²) │ O(n)  │ Trick      │
// │ 3. Counter (only ONE bracket type)   │ O(n)  │ O(1)  │ Limited    │
// └──────────────────────────────────────┴───────┴───────┴────────────┘
//
// IMPORTANT: this checks NESTING ORDER. For pure count parity (where
// "([)]" returns true), see the "Balanced Brackets (Count)" template.

// ----- Approach 1: Stack (canonical answer) -----
// Push opens; on close, pop and verify match. Empty stack at end = valid.
// This is the single most-asked stack interview question.
function isValid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}

// ----- Approach 2: Repeatedly remove empty pairs (concise but O(n²)) -----
// Keep replacing "()", "[]", "{}" with "" until no more matches.
// If the final string is empty, the input was valid. Cute but slow.
function isValidReplace(s) {
  let prev;
  do {
    prev = s;
    s = s.replace(/\\(\\)|\\[\\]|\\{\\}/g, "");
  } while (s !== prev);
  return s === "";
}

// ----- Approach 3: Counter (only works for ONE bracket type) -----
// If the input were guaranteed to be only "()", you could do this in O(1)
// space: count must never go negative, and must end at zero.
// DOESN'T work for mixed brackets — order can't be tracked with a counter.
function isValidParensOnly(s) {
  let count = 0;
  for (const ch of s) {
    if (ch === "(") count++;
    else if (ch === ")") {
      count--;
      if (count < 0) return false;
    }
  }
  return count === 0;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (stack) — BEST ---");
test("Simple match", isValid("()"), true);
test("Nested mix", isValid("()[]{}"), true);
test("Wrong order", isValid("(]"), false);
test("Mismatched", isValid("([)]"), false);
test("Empty", isValid(""), true);
test("Only opens", isValid("((("), false);

console.log("\\n--- Approach 2 (replace-empty-pairs) — same outputs ---");
test("Replace: nested", isValidReplace("()[]{}"), true);
test("Replace: mismatched", isValidReplace("([)]"), false);

// ===== When to pick which =====
// - Always Approach 1. The canonical answer; senior signal of "I see this
//   is a stack problem the moment I read it."
// - Approach 2 is a fun trick but O(n²) due to repeated replace passes;
//   not appropriate for production.
// - Approach 3 is what you'd use ONLY if guaranteed a single bracket type
//   (e.g., the simpler "balanced parens" subproblem).
//
// Why a stack: the problem has the LIFO property — the most recently opened
// bracket must be the next to close. That's the textbook stack signal.`,

  'Merge Sorted Arrays': `// ===== SOLUTION: Merge Sorted Arrays =====
//
// ┌────────────────────────────────────┬────────────┬───────┬────────────┐
// │ Approach                           │ Time       │ Space │ Verdict    │
// ├────────────────────────────────────┼────────────┼───────┼────────────┤
// │ 1. Two-pointer merge               │ O(m+n)     │ O(m+n)│ BEST       │
// │ 2. Concat + sort                   │ O((m+n)log)│ O(m+n)│ Concise    │
// │ 3. In-place from end (LeetCode 88) │ O(m+n)     │ O(1)  │ When dest exists │
// └────────────────────────────────────┴────────────┴───────┴────────────┘

// ----- Approach 1: Two-pointer merge (BEST) -----
// Walk both arrays in parallel; pick the smaller current head each step.
// This is the merge-step of merge sort — the canonical answer.
function merge(a, b) {
  const result = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) result.push(a[i++]);
    else result.push(b[j++]);
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}

// ----- Approach 2: Concat + sort (1-liner; throws away the "sorted" property) -----
// Cute, but you're paying O((m+n) log (m+n)) when the inputs are already
// sorted — the whole point of the problem is that you can do better.
function mergeConcatSort(a, b) {
  return [...a, ...b].sort((x, y) => x - y);
}

// ----- Approach 3: In-place from the end (LeetCode 88 variant) -----
// When the destination is given as one of the inputs (a) with extra space
// at the end, fill from the END to avoid overwriting unread elements.
// Saves O(m+n) extra space.
function mergeInPlace(a, m, b, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && a[i] > b[j]) a[k--] = a[i--];
    else a[k--] = b[j--];
  }
  return a;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (two-pointer) — BEST ---");
test("Equal lengths", merge([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
test("Different lengths", merge([1, 2, 3], [4, 5, 6, 7]), [1, 2, 3, 4, 5, 6, 7]);
test("One empty", merge([], [1, 2, 3]), [1, 2, 3]);
test("Both empty", merge([], []), []);
test("With duplicates", merge([1, 2, 2], [2, 3]), [1, 2, 2, 2, 3]);

console.log("\\n--- Approach 2 (concat + sort) — same outputs but slower ---");
test("Sort: equal", mergeConcatSort([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);

// ===== When to pick which =====
// - Default → Approach 1 (two-pointer). Linear, exploits the sortedness.
// - Approach 2 only when m+n is tiny and code-golf matters more than perf.
// - Approach 3 is the LeetCode-88 in-place variant — useful when memory
//   is constrained and the destination buffer already has space allocated.
//
// Why used: this is the building block of merge sort, external sort,
// k-way merge for log aggregation, and stream-of-sorted-files merging.`,

  'Flatten Array': `// ===== SOLUTION: Flatten Array =====
//
// ┌──────────────────────────────────────┬───────┬───────────┬─────────────┐
// │ Approach                             │ Time  │ Space     │ Verdict     │
// ├──────────────────────────────────────┼───────┼───────────┼─────────────┤
// │ 1. Recursion (with depth param)      │ O(n)  │ O(d) stack│ BEST + flexible │
// │ 2. Iterative stack (no recursion)    │ O(n)  │ O(n)      │ Stack-safe  │
// │ 3. reduce + recursion                │ O(n)  │ O(d)      │ Functional  │
// │ 4. Array.prototype.flat(Infinity)    │ O(n)  │ O(n)      │ Use this IRL│
// └──────────────────────────────────────┴───────┴───────────┴─────────────┘
// d = max nesting depth.

// ----- Approach 1: Recursion with depth param (BEST flexibility) -----
// depth=Infinity = full flatten; depth=1 = one level (matches Array.flat).
function flatten(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

// ----- Approach 2: Iterative stack (stack-overflow-safe for very deep arrays) -----
// Recursion blows the JS stack at ~10k depth. Iterative version handles any depth.
function flattenIterative(arr) {
  const stack = [...arr];
  const result = [];
  while (stack.length) {
    const next = stack.pop();
    if (Array.isArray(next)) stack.push(...next);
    else result.unshift(next);   // push to front since we're popping in reverse
  }
  return result;
}

// ----- Approach 3: reduce + recursion (functional 1-liner) -----
function flattenReduce(arr) {
  return arr.reduce(
    (flat, item) => flat.concat(Array.isArray(item) ? flattenReduce(item) : item),
    []
  );
}

// ----- Approach 4: Native Array.flat (USE THIS IN PRODUCTION) -----
// ES2019+. Native, fastest, handles depth correctly. The only reason to
// implement manually is during interviews to demonstrate the algorithm.
function flattenNative(arr, depth = Infinity) {
  return arr.flat(depth);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (recursion + depth) — BEST flexibility ---");
test("Deep nested", flatten([1, [2, [3, [4, [5]]]]]), [1, 2, 3, 4, 5]);
test("Depth 1", flatten([1, [2, [3, [4]]]], 1), [1, 2, [3, [4]]]);
test("Depth 2", flatten([1, [2, [3, [4]]]], 2), [1, 2, 3, [4]]);
test("Already flat", flatten([1, 2, 3]), [1, 2, 3]);
test("Empty", flatten([]), []);

console.log("\\n--- Approach 2 (iterative stack) — stack-safe ---");
test("Iter: deep", flattenIterative([1, [2, [3, [4, [5]]]]]), [1, 2, 3, 4, 5]);

console.log("\\n--- Approach 4 (native flat) — production ---");
test("Native: deep", flattenNative([1, [2, [3, [4, [5]]]]]), [1, 2, 3, 4, 5]);

// ===== When to pick which =====
// - Production code → Approach 4 (Array.flat). Native, optimal.
// - Interview / no built-ins allowed → Approach 1. Cleanest manual impl.
// - Pathologically deep arrays (10k+ depth) → Approach 2 (iterative stack).
// - Functional-style codebase / tight 1-liner → Approach 3.
//
// Why this is asked: tests recursion, type-checking via Array.isArray,
// understanding of stack risk for deep recursion, and knowledge of ES2019+.`,

  'Debounce': `// ===== SOLUTION: Debounce =====
//
// ┌──────────────────────────────────────┬───────────────────┬────────────┐
// │ Approach (variant)                   │ Behavior          │ Verdict    │
// ├──────────────────────────────────────┼───────────────────┼────────────┤
// │ 1. Trailing edge (most common)       │ Fires after quiet │ DEFAULT    │
// │ 2. Leading edge                      │ Fires immediately │ Submits etc│
// │ 3. Leading + trailing (lodash style) │ Both              │ Most flex  │
// │ 4. With cancel/flush methods         │ Cancellable       │ Production │
// └──────────────────────────────────────┴───────────────────┴────────────┘

// ----- Approach 1: Trailing edge (the default behavior — DEFAULT) -----
// Each call cancels the previous and reschedules. Fires once after delay
// ms of silence. Used for: search-as-you-type, resize handlers, autosave.
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ----- Approach 2: Leading edge (fires immediately, ignores rapid follows) -----
// Used for: button-click protection (fire once, ignore double-click).
// Different semantics from trailing — fires on the FIRST call.
function debounceLeading(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer === null) fn.apply(this, args);
    clearTimeout(timer);
    timer = setTimeout(() => { timer = null; }, delay);
  };
}

// ----- Approach 3: Leading + trailing (lodash-compatible) -----
// Configurable: { leading: true, trailing: true } fires on first call AND
// after the burst of subsequent calls.
function debounceFull(fn, delay, { leading = false, trailing = true } = {}) {
  let timer = null;
  let lastArgs = null;
  return function (...args) {
    const callNow = leading && timer === null;
    lastArgs = args;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) fn.apply(this, lastArgs);
      lastArgs = null;
    }, delay);
    if (callNow) fn.apply(this, args);
  };
}

// ----- Approach 4: With cancel/flush (production-grade) -----
// React-friendly: useEffect cleanup can call .cancel() on unmount.
function debounceCancellable(fn, delay) {
  let timer;
  let lastArgs;
  function debounced(...args) {
    lastArgs = args;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, lastArgs), delay);
  }
  debounced.cancel = () => { clearTimeout(timer); lastArgs = null; };
  debounced.flush  = () => { clearTimeout(timer); if (lastArgs) fn.apply(null, lastArgs); lastArgs = null; };
  return debounced;
}

// ===== TEST CASES =====
let counter = 0;
const debouncedIncrement = debounce(() => counter++, 100);

debouncedIncrement();
debouncedIncrement();
debouncedIncrement();

setTimeout(() => {
  console.log(counter === 1 ? "✅" : "❌", \`Trailing: expected 1 call, got \${counter}\`);

  // Leading-edge variant: fires immediately, ignores rapid follows
  let leadCounter = 0;
  const leadInc = debounceLeading(() => leadCounter++, 100);
  leadInc(); leadInc(); leadInc();
  setTimeout(() => {
    console.log(leadCounter === 1 ? "✅" : "❌", \`Leading: expected 1 call, got \${leadCounter}\`);
  }, 150);
}, 150);

// ===== When to pick which =====
// - Search input, resize, scroll handler → Approach 1 (trailing).
// - Form submit / button protection → Approach 2 (leading).
// - Both edges (lodash debounce default) → Approach 3.
// - React component (useEffect cleanup) → Approach 4 with .cancel().
//
// Why used: rate-limits expensive work (API calls, heavy renders) so that
// rapid-fire events (typing, scrolling) don't fire the handler N times —
// only after the user pauses, OR only on the first event of a burst.`,

  'Group Anagrams': `// ===== SOLUTION: Group Anagrams =====
//
// ┌────────────────────────────────────┬─────────────┬───────┬────────────┐
// │ Approach                           │ Time        │ Space │ Verdict    │
// ├────────────────────────────────────┼─────────────┼───────┼────────────┤
// │ 1. Sorted-string key               │ O(n·k log k)│ O(n·k)│ Clearest   │
// │ 2. Char-count signature key        │ O(n·k)      │ O(n·k)│ BEST perf  │
// │ 3. Prime-product key               │ O(n·k)      │ O(n·k)│ Math-y     │
// └────────────────────────────────────┴─────────────┴───────┴────────────┘
// k = average word length, n = number of words.

// ----- Approach 1: Sorted string as the key (cleanest) -----
// "eat", "tea", "ate" all sort to "aet" → same key, same group.
function groupAnagrams(strs) {
  const groups = new Map();
  for (const word of strs) {
    const key = [...word].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

// ----- Approach 2: Char-count signature (BEST perf — avoids per-word sort) -----
// Build a 26-slot count array per word; convert to string as the key.
// O(k) per word vs O(k log k) sort — wins for large k.
function groupAnagramsCount(strs) {
  const groups = new Map();
  for (const word of strs) {
    const counts = new Array(26).fill(0);
    for (const ch of word) counts[ch.charCodeAt(0) - 97]++;
    const key = counts.join(",");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

// ----- Approach 3: Prime-product key (math trick) -----
// Map each letter to a prime; multiply primes per word. By unique-prime
// factorization, anagrams produce the same product. Risk: integer
// overflow for long words (numbers above MAX_SAFE_INTEGER).
function groupAnagramsPrime(strs) {
  const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101];
  const groups = new Map();
  for (const word of strs) {
    let key = 1;
    for (const ch of word) key *= primes[ch.charCodeAt(0) - 97];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const normalize = (arr) =>
    arr.map(g => [...g].sort()).sort((a, b) => a.join(",").localeCompare(b.join(",")));
  const pass = JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (sorted key) — clearest ---");
test("Mixed anagrams", groupAnagrams(["eat","tea","tan","ate","nat","bat"]), [["eat","tea","ate"],["tan","nat"],["bat"]]);
test("Single string", groupAnagrams(["a"]), [["a"]]);
test("Empty string", groupAnagrams([""]), [[""]]);
test("No anagrams", groupAnagrams(["abc","def","ghi"]), [["abc"],["def"],["ghi"]]);

console.log("\\n--- Approach 2 (char-count) — BEST perf ---");
test("Count: mixed", groupAnagramsCount(["eat","tea","tan","ate","nat","bat"]), [["eat","tea","ate"],["tan","nat"],["bat"]]);

// ===== When to pick which =====
// - Default → Approach 1. Easiest to write and explain.
// - Long words / large alphabet / hot path → Approach 2.
// - Approach 3 is a fun math trick but fragile; don't use in production.
//
// Why this is asked: tests that you spot the "canonicalize then group"
// pattern (used in deduplication, equivalence-class problems, hashing).`,

  'Find Duplicates': `// ===== SOLUTION: Find Duplicates =====
//
// ┌─────────────────────────────────┬───────┬───────┬─────────────┐
// │ Approach                        │ Time  │ Space │ Verdict     │
// ├─────────────────────────────────┼───────┼───────┼─────────────┤
// │ 1. Two Sets (seen + dups)       │ O(n)  │ O(n)  │ BEST        │
// │ 2. Hash count, then filter > 1  │ O(n)  │ O(n)  │ Verbose     │
// │ 3. Sort + scan adjacent pairs   │ O(n log n)│ O(1)│ When mem matters│
// │ 4. filter + indexOf/lastIndexOf │ O(n²) │ O(1)  │ Don't ship  │
// └─────────────────────────────────┴───────┴───────┴─────────────┘

// ----- Approach 1: Two sets, single pass (BEST) -----
// 'seen' tracks every value; 'dups' deduplicates the result automatically
// (handles values appearing 3+ times without producing repeats).
function findDuplicates(arr) {
  const seen = new Set();
  const dups = new Set();
  for (const item of arr) {
    if (seen.has(item)) dups.add(item);
    else seen.add(item);
  }
  return [...dups];
}

// ----- Approach 2: Frequency map (good when you also need counts) -----
function findDuplicatesByCount(arr) {
  const counts = new Map();
  for (const item of arr) counts.set(item, (counts.get(item) || 0) + 1);
  return [...counts.entries()].filter(([, c]) => c > 1).map(([v]) => v);
}

// ----- Approach 3: Sort + scan (uses O(1) extra space when mutation OK) -----
function findDuplicatesSort(arr) {
  const sorted = [...arr].sort();
  const result = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] && sorted[i] !== sorted[i - 2]) {
      result.push(sorted[i]);
    }
  }
  return result;
}

// ----- Approach 4: filter + indexOf (DON'T SHIP — O(n²)) -----
function findDuplicatesSlow(arr) {
  return arr.filter((v, i) => arr.indexOf(v) !== i).filter((v, i, a) => a.indexOf(v) === i);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const sortIfArr = (a) => Array.isArray(a) ? [...a].sort() : a;
  const pass = JSON.stringify(sortIfArr(actual)) === JSON.stringify(sortIfArr(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (two sets) — BEST ---");
test("Numbers", findDuplicates([1, 2, 3, 2, 4, 3, 5]), [2, 3]);
test("Strings", findDuplicates(["a", "b", "a", "c"]), ["a"]);
test("No duplicates", findDuplicates([1, 2, 3, 4]), []);
test("All same", findDuplicates([7, 7, 7]), [7]);
test("Triple duplicate", findDuplicates([1, 1, 1, 2, 2]), [1, 2]);

console.log("\\n--- Approach 2 (frequency map) — same outputs ---");
test("Counts: numbers", findDuplicatesByCount([1, 2, 3, 2, 4, 3, 5]), [2, 3]);

// ===== When to pick which =====
// - Default → Approach 1. Cleanest, single pass, handles n>2 cases for free.
// - Need counts too? → Approach 2 returns occurrence counts as a Map.
// - Memory-constrained or array is already sorted → Approach 3.
// - Approach 4 is a teaching baseline only.`,

  'Remove Duplicates': `// ===== SOLUTION: Remove Duplicates =====
//
// ┌──────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                             │ Time  │ Space │ Verdict    │
// ├──────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Set + push (preserves order)      │ O(n)  │ O(n)  │ BEST       │
// │ 2. [...new Set(arr)] (1-line)        │ O(n)  │ O(n)  │ Idiomatic  │
// │ 3. filter + indexOf                  │ O(n²) │ O(n)  │ Don't ship │
// │ 4. reduce + includes                 │ O(n²) │ O(n)  │ Don't ship │
// └──────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Set + manual push (BEST when "no Set" allowed) -----
// Hash set lookup is O(1); preserves first-seen order via push.
function removeDuplicates(arr) {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

// ----- Approach 2: [...new Set(arr)] (idiomatic 1-liner — production) -----
// Set preserves insertion order in JavaScript (since ES2015). Safe to use.
function removeDuplicatesSpread(arr) {
  return [...new Set(arr)];
}

// ----- Approach 3: filter + indexOf (DON'T SHIP — O(n²)) -----
// Each indexOf is O(n); inside a filter that's O(n²). Easy to write,
// terrible for large arrays.
function removeDuplicatesIndexOf(arr) {
  return arr.filter((v, i) => arr.indexOf(v) === i);
}

// ----- Approach 4: reduce + includes (DON'T SHIP — same O(n²) issue) -----
function removeDuplicatesReduce(arr) {
  return arr.reduce((acc, v) => acc.includes(v) ? acc : [...acc, v], []);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (Set + push) — BEST ---");
test("Numbers", removeDuplicates([1, 2, 1, 3, 2, 4]), [1, 2, 3, 4]);
test("Strings", removeDuplicates(["a", "b", "a", "c", "b"]), ["a", "b", "c"]);
test("Already unique", removeDuplicates([1, 2, 3]), [1, 2, 3]);
test("All same", removeDuplicates([5, 5, 5, 5]), [5]);
test("Empty", removeDuplicates([]), []);

console.log("\\n--- Approach 2 ([...new Set]) — idiomatic ---");
test("Spread: numbers", removeDuplicatesSpread([1, 2, 1, 3, 2, 4]), [1, 2, 3, 4]);

// ===== When to pick which =====
// - Production code → Approach 2 ([...new Set(arr)]). One line, native, fast.
// - Interview "implement without Set" → Approach 1 (manual hash + push).
//   Some interviewers explicitly forbid Set to test the underlying pattern.
// - Approach 3 / 4 are baselines for the optimization discussion only.
//
// Why used: this is the dedupe pattern at the heart of "unique users,"
// "distinct values," "uniqueness-by-key" problems.`,

  'Find Missing Number': `// ===== SOLUTION: Find Missing Number =====
//
// ┌─────────────────────────────────┬───────┬───────┬─────────────┐
// │ Approach                        │ Time  │ Space │ Verdict     │
// ├─────────────────────────────────┼───────┼───────┼─────────────┤
// │ 1. Sum formula  n(n+1)/2 - sum  │ O(n)  │ O(1)  │ BEST        │
// │ 2. XOR (overflow-safe)          │ O(n)  │ O(1)  │ Numerically │
// │                                 │       │       │ safer       │
// │ 3. Set lookup                   │ O(n)  │ O(n)  │ Readable    │
// │ 4. Sort + scan                  │ O(n log n)│ O(1) │ Don't ship │
// └─────────────────────────────────┴───────┴───────┴─────────────┘

// ----- Approach 1: Sum formula (BEST) -----
// Expected sum of [0..n] is n*(n+1)/2. Difference = the missing number.
function findMissing(nums) {
  const n = nums.length;
  const expected = (n * (n + 1)) / 2;
  const actual = nums.reduce((sum, x) => sum + x, 0);
  return expected - actual;
}

// ----- Approach 2: XOR (no overflow risk for huge n) -----
// XOR of [0..n] xor with XOR of all nums leaves the missing number.
// Useful when n is so large that the sum would overflow Number.MAX_SAFE_INTEGER.
function findMissingXOR(nums) {
  let result = nums.length;          // start with n itself
  for (let i = 0; i < nums.length; i++) {
    result ^= i ^ nums[i];           // pairs cancel; the missing number remains
  }
  return result;
}

// ----- Approach 3: Set (most readable) -----
function findMissingSet(nums) {
  const present = new Set(nums);
  for (let i = 0; i <= nums.length; i++) {
    if (!present.has(i)) return i;
  }
  return -1;
}

// ----- Approach 4: Sort + linear scan (DON'T SHIP — O(n log n)) -----
function findMissingSort(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) return i;
  }
  return sorted.length;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (sum formula) — BEST ---");
test("Missing 2", findMissing([3, 0, 1]), 2);
test("Missing last", findMissing([0, 1]), 2);
test("Missing first", findMissing([1, 2]), 0);
test("Single missing 0", findMissing([1]), 0);
test("Larger array", findMissing([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);

console.log("\\n--- Approach 2 (XOR) — same outputs, overflow-safe ---");
test("XOR: missing 2", findMissingXOR([3, 0, 1]), 2);
test("XOR: larger",     findMissingXOR([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);

// ===== When to pick which =====
// - Default → Approach 1 (sum formula). Simplest and fastest.
// - n approaching 2^53 / values approaching MAX_SAFE_INTEGER → Approach 2 (XOR)
//   to avoid any overflow concerns; XOR has no notion of overflow.
// - Code-review readability matters more than constant-factor → Approach 3.
// - Approach 4 is a baseline; the sort dominates the cost.`,

  'Move Zeros': `// ===== SOLUTION: Move Zeros to End =====
//
// ┌────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                           │ Time  │ Space │ Verdict    │
// ├────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Two-pointer write index         │ O(n)  │ O(1)  │ BEST       │
// │ 2. Two-pointer with swap           │ O(n)  │ O(1)  │ Single pass│
// │ 3. filter + pad with zeros         │ O(n)  │ O(n)  │ Concise    │
// └────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Two-pointer write index (BEST clarity) -----
// First pass: copy non-zeros forward. Second pass: fill the rest with 0.
// Two passes but each is straightforward.
function moveZeros(nums) {
  let writeIndex = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[writeIndex++] = nums[i];
    }
  }
  for (let i = writeIndex; i < nums.length; i++) {
    nums[i] = 0;
  }
  return nums;
}

// ----- Approach 2: Single-pass swap (slightly more elegant) -----
// Swap non-zero forward; never touches the same element twice.
// Same O(n), in one pass — sometimes preferred in interviews.
function moveZerosSwap(nums) {
  let writeIndex = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[i], nums[writeIndex]] = [nums[writeIndex], nums[i]];
      writeIndex++;
    }
  }
  return nums;
}

// ----- Approach 3: filter + pad (concise; allocates new array) -----
function moveZerosFilter(nums) {
  const nonZeros = nums.filter(n => n !== 0);
  const zeros = new Array(nums.length - nonZeros.length).fill(0);
  return [...nonZeros, ...zeros];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (write index, two-pass) — BEST ---");
test("Mixed", moveZeros([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
test("All zeros", moveZeros([0, 0, 0]), [0, 0, 0]);
test("No zeros", moveZeros([1, 2, 3]), [1, 2, 3]);
test("Single zero", moveZeros([0]), [0]);
test("Zeros first", moveZeros([0, 0, 1, 2]), [1, 2, 0, 0]);

console.log("\\n--- Approach 2 (swap, single pass) — same outputs ---");
test("Swap: mixed", moveZerosSwap([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);

// ===== When to pick which =====
// - In-place required (LeetCode 283 phrasing) → Approach 1 or 2.
// - Interview where elegance matters → Approach 2 (one pass, no extra fill).
// - Quick read-only transformation → Approach 3.
//
// Why used: tests the "two-pointer with write index" idiom — fundamental
// for in-place array compaction (filter, partition, dedup-in-place).`,

  'Rotate Array': `// ===== SOLUTION: Rotate Array =====
//
// ┌──────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                             │ Time  │ Space │ Verdict    │
// ├──────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Slice + concat (returns new)      │ O(n)  │ O(n)  │ BEST clear │
// │ 2. Reverse three times (in-place)    │ O(n)  │ O(1)  │ BEST space │
// │ 3. Cyclic replacement                │ O(n)  │ O(1)  │ Tricky     │
// │ 4. Pop + unshift in loop             │ O(n·k)│ O(1)  │ Don't ship │
// └──────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Slice + concat (BEST clarity) -----
// Normalize k by mod n first (k can be larger than length).
function rotate(nums, k) {
  const n = nums.length;
  if (n === 0) return [];
  const shift = k % n;
  return [...nums.slice(n - shift), ...nums.slice(0, n - shift)];
}

// ----- Approach 2: Reverse three times (BEST space — in-place, O(1) extra) -----
// (a) Reverse the whole array.
// (b) Reverse the first k elements.
// (c) Reverse the rest.
// Classic in-place rotation trick. The interviewer's favorite.
function rotateReverse(nums, k) {
  const n = nums.length;
  if (n === 0) return [];
  k = k % n;
  const reverse = (a, l, r) => { while (l < r) { [a[l], a[r]] = [a[r], a[l]]; l++; r--; } };
  reverse(nums, 0, n - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, n - 1);
  return nums;
}

// ----- Approach 3: Cyclic replacement (in-place, single pass — tricky to write) -----
// Walk through cycles of size gcd(n, k). Hardest to get right but elegant.
function rotateCyclic(nums, k) {
  const n = nums.length;
  if (n === 0) return [];
  k = k % n;
  let count = 0;
  for (let start = 0; count < n; start++) {
    let current = start;
    let prev = nums[start];
    do {
      const next = (current + k) % n;
      [nums[next], prev] = [prev, nums[next]];
      current = next;
      count++;
    } while (start !== current);
  }
  return nums;
}

// ----- Approach 4: pop + unshift (DON'T SHIP — O(n·k)) -----
function rotateNaive(nums, k) {
  k = k % nums.length;
  for (let i = 0; i < k; i++) nums.unshift(nums.pop());
  return nums;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (slice + concat) — BEST clarity ---");
test("Rotate by 2", rotate([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]);
test("k > length",  rotate([1, 2], 5), [2, 1]);
test("k = 0",        rotate([1, 2, 3], 0), [1, 2, 3]);
test("k = length",   rotate([1, 2, 3], 3), [1, 2, 3]);
test("Single",       rotate([1], 5), [1]);

console.log("\\n--- Approach 2 (reverse 3x) — BEST space ---");
test("Reverse: 2", rotateReverse([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]);

// ===== When to pick which =====
// - Producing a new array is fine → Approach 1.
// - Mutating in place required (LeetCode 189) → Approach 2 (reverse-three).
// - Approach 3 is a fun trick but harder to debug; rarely worth it.
// - Approach 4 is the "obvious" baseline; bad when k is large.
//
// Why this is asked: tests modular arithmetic (k % n), in-place vs return-new
// trade-offs, and recognition of the reverse-three-times pattern.`,

  'Bubble Sort': `// ===== SOLUTION: Bubble Sort =====
//
// ┌──────────────────────────────────────┬──────────────┬───────┬────────────┐
// │ Approach                             │ Time         │ Space │ Verdict    │
// ├──────────────────────────────────────┼──────────────┼───────┼────────────┤
// │ 1. Basic bubble sort                 │ O(n²) all    │ O(1)  │ Baseline   │
// │ 2. With early-exit (swapped flag)    │ O(n) best    │ O(1)  │ BEST       │
// │ 3. Cocktail / bidirectional shaker   │ O(n²)        │ O(1)  │ Slight win │
// └──────────────────────────────────────┴──────────────┴───────┴────────────┘

// ----- Approach 1: Basic (no optimization) -----
// Always runs n²/2 comparisons even on a sorted input. Useful as a
// teaching baseline before adding the optimization.
function bubbleSortBasic(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  return a;
}

// ----- Approach 2: Early-exit (BEST: O(n) on already-sorted input) -----
// If a full pass makes no swaps, the array is sorted; break out.
// This is the canonical "improved bubble sort" interview answer.
function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}

// ----- Approach 3: Cocktail (bidirectional bubble) -----
// Alternates left-to-right and right-to-left passes. Helps when "small"
// elements ("turtles") are near the end — basic bubble pushes them
// forward only one step per pass.
function cocktailSort(arr) {
  const a = [...arr];
  let start = 0, end = a.length - 1, swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; swapped = true; }
    }
    if (!swapped) break;
    swapped = false;
    end--;
    for (let i = end - 1; i >= start; i--) {
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; swapped = true; }
    }
    start++;
  }
  return a;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 2 (early-exit) — BEST ---");
test("Mixed",       bubbleSort([5, 1, 4, 2, 8]), [1, 2, 4, 5, 8]);
test("Reversed",    bubbleSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",      bubbleSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("With duplicates", bubbleSort([3, 1, 2, 3, 1]), [1, 1, 2, 3, 3]);
test("Empty",       bubbleSort([]), []);

// ===== When to pick which =====
// - Bubble sort itself isn't used in production — V8's Array.prototype.sort
//   uses TimSort (a hybrid of merge sort + insertion sort).
// - Approach 2 is the canonical interview answer when asked "implement bubble sort."
// - Approach 3 is a curiosity; almost never worth implementing.
// - For real sorts in JS: arr.sort((a, b) => a - b) — O(n log n), stable.
//
// Why bubble sort is taught: simplest sorting algorithm to explain. The
// adjacent-swap idea is the foundation for understanding more complex sorts.`,

  'Quick Sort': `// ===== SOLUTION: Quick Sort =====
//
// ┌────────────────────────────────────────┬──────────────┬───────────┬────────────┐
// │ Approach                               │ Time avg     │ Space     │ Verdict    │
// ├────────────────────────────────────────┼──────────────┼───────────┼────────────┤
// │ 1. Three-way partition (allocates)     │ O(n log n)   │ O(n)      │ BEST clear │
// │ 2. Lomuto in-place partition           │ O(n log n)   │ O(log n)  │ Classic    │
// │ 3. Hoare in-place partition            │ O(n log n)   │ O(log n)  │ Faster avg │
// │ 4. Random pivot variant                │ O(n log n)   │ O(log n)  │ Worst-case avoidance │
// └────────────────────────────────────────┴──────────────┴───────────┴────────────┘
// Worst case for all: O(n²) on adversarial input (use random pivot to avoid).

// ----- Approach 1: Three-way partition (clearest) -----
// Allocates three buckets per call. Easier to reason about; not as memory-tight
// as the in-place versions. Middle pivot avoids worst case on sorted input.
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const less = [], equal = [], greater = [];
  for (const x of arr) {
    if (x < pivot) less.push(x);
    else if (x > pivot) greater.push(x);
    else equal.push(x);
  }
  return [...quickSort(less), ...equal, ...quickSort(greater)];
}

// ----- Approach 2: Lomuto partition (classic in-place) -----
// Simpler partition logic; pivot at the end. Used in most textbooks.
// Slightly more swaps on average than Hoare's, but easier to implement.
function quickSortLomuto(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    quickSortLomuto(arr, low, i);
    quickSortLomuto(arr, i + 2, high);
  }
  return arr;
}

// ----- Approach 3: Random pivot (avoids O(n²) on sorted input) -----
function quickSortRandom(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(Math.random() * arr.length)];
  const less = [], equal = [], greater = [];
  for (const x of arr) {
    if (x < pivot) less.push(x);
    else if (x > pivot) greater.push(x);
    else equal.push(x);
  }
  return [...quickSortRandom(less), ...equal, ...quickSortRandom(greater)];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (three-way) — BEST clarity ---");
test("Mixed",      quickSort([3, 6, 1, 4, 8, 2]), [1, 2, 3, 4, 6, 8]);
test("Reversed",   quickSort([9, 7, 5, 3, 1]), [1, 3, 5, 7, 9]);
test("Sorted",     quickSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("Single",     quickSort([42]), [42]);
test("Duplicates", quickSort([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3]);

// ===== When to pick which =====
// - Whiteboard, focus on correctness → Approach 1. Most intuitive.
// - Production-style in-place sort → Approach 2 (Lomuto) or Hoare.
// - Adversarial input possible (e.g., user-supplied) → Approach 3 (random pivot)
//   or shuffle the array first.
//
// Real-world JS doesn't use quicksort for Array.prototype.sort — V8 uses
// TimSort. Quicksort is taught for the partition idea, divide-and-conquer
// recursion, and the worst-case-vs-average-case discussion (which is a
// common interview probe).`,

  'Merge Sort': `// ===== SOLUTION: Merge Sort =====
//
// ┌────────────────────────────────────┬──────────────┬───────┬────────────┐
// │ Approach                           │ Time         │ Space │ Verdict    │
// ├────────────────────────────────────┼──────────────┼───────┼────────────┤
// │ 1. Top-down (recursive split)      │ O(n log n)   │ O(n)  │ BEST clear │
// │ 2. Bottom-up (iterative)           │ O(n log n)   │ O(n)  │ Stack-safe │
// │ 3. In-place merge sort             │ O(n log² n)  │ O(1)  │ Trade-off  │
// └────────────────────────────────────┴──────────────┴───────┴────────────┘
// Always O(n log n) — guaranteed, even worst case. Stable sort.

// ----- Approach 1: Top-down recursive (BEST clarity — textbook) -----
// Recursively split until single elements; merge two sorted halves at each level.
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

// ----- Approach 2: Bottom-up iterative (no recursion — stack-safe) -----
// Start with width=1 (each element is "sorted"); merge pairs of width-1
// sub-arrays into width-2; then width-4; etc. Avoids recursion stack growth
// for very large arrays.
function mergeSortBottomUp(arr) {
  let result = [...arr];
  const n = result.length;
  for (let width = 1; width < n; width *= 2) {
    const next = [];
    for (let i = 0; i < n; i += width * 2) {
      const left = result.slice(i, i + width);
      const right = result.slice(i + width, i + width * 2);
      next.push(...merge(left, right));
    }
    result = next;
  }
  return result;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

console.log("--- Approach 1 (top-down recursive) — BEST clarity ---");
test("Mixed",     mergeSort([5, 2, 8, 1, 9, 3]), [1, 2, 3, 5, 8, 9]);
test("Reversed",  mergeSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",    mergeSort([1, 2, 3]), [1, 2, 3]);
test("Empty",     mergeSort([]), []);
test("Big",       mergeSort([10, -5, 7, 0, 3, 7]), [-5, 0, 3, 7, 7, 10]);

console.log("\\n--- Approach 2 (bottom-up iterative) — same outputs ---");
test("Bottom-up: mixed", mergeSortBottomUp([5, 2, 8, 1, 9, 3]), [1, 2, 3, 5, 8, 9]);

// ===== When to pick which =====
// - Default → Approach 1. Cleanest; matches the textbook diagram.
// - Massive arrays (millions of elements, deep recursion concern) → Approach 2.
// - In-place merge sort exists (O(n log² n)) but is rarely taught — practical
//   in-place sorts use heapsort or introsort instead.
//
// Why merge sort is taught:
// - Guaranteed O(n log n) — quicksort can degrade to O(n²) without random pivot.
// - Stable — preserves relative order of equal elements.
// - The merge step is the building block of external sort (sorting data
//   that doesn't fit in memory) and k-way merge for log aggregation.
// - V8's Array.prototype.sort uses TimSort, which is merge sort + insertion
//   sort hybrid — so this is "what production sort actually does."`,

  'Anagram Check': `// ===== SOLUTION: Anagram Check =====
//
// ┌──────────────────────────────────┬────────────┬───────┬────────────┐
// │ Approach                         │ Time       │ Space │ Verdict    │
// ├──────────────────────────────────┼────────────┼───────┼────────────┤
// │ 1. Frequency map (count + decr)  │ O(n)       │ O(k)  │ BEST       │
// │ 2. Sort + compare                │ O(n log n) │ O(n)  │ Concise    │
// │ 3. Char-code array (ASCII only)  │ O(n)       │ O(1)  │ Tightest   │
// └──────────────────────────────────┴────────────┴───────┴────────────┘
// k = unique chars in alphabet (26 for English).

// ----- Approach 1: Frequency map (BEST: O(n) time, works for any charset) -----
// Increment counts for s1, decrement for s2. If any count goes negative
// or a key is missing, not an anagram.
function isAnagram(s1, s2) {
  const a = s1.toLowerCase().replace(/\\s/g, "");
  const b = s2.toLowerCase().replace(/\\s/g, "");
  if (a.length !== b.length) return false;
  const freq = {};
  for (const ch of a) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of b) {
    if (!freq[ch]) return false;
    freq[ch]--;
  }
  return true;
}

// ----- Approach 2: Sort + compare (most concise; O(n log n)) -----
// Quick to write, slower in big-O. Acceptable for short strings or
// throwaway code; not for hot paths.
function isAnagramSort(s1, s2) {
  const norm = (s) => s.toLowerCase().replace(/\\s/g, "").split("").sort().join("");
  return norm(s1) === norm(s2);
}

// ----- Approach 3: Char-code array, ASCII only (O(1) space) -----
// 26 slots for 'a'..'z'. Fastest constant factors, but only works for
// strings whose characters fit a known fixed alphabet.
function isAnagramAscii(s1, s2) {
  const a = s1.toLowerCase().replace(/\\s/g, "");
  const b = s2.toLowerCase().replace(/\\s/g, "");
  if (a.length !== b.length) return false;
  const counts = new Int8Array(26);
  for (let i = 0; i < a.length; i++) {
    counts[a.charCodeAt(i) - 97]++;
    counts[b.charCodeAt(i) - 97]--;
  }
  return counts.every(c => c === 0);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (frequency map) — BEST ---");
test("Classic anagram",   isAnagram("listen", "silent"), true);
test("Not anagram",       isAnagram("hello", "world"),  false);
test("Different lengths", isAnagram("abc", "abcd"),     false);
test("Case insensitive",  isAnagram("Astronomer", "Moon starer"), true);
test("Empty strings",     isAnagram("", ""),             true);

console.log("\\n--- Approach 2 (sort + compare) — same outputs ---");
test("Sort: classic", isAnagramSort("listen", "silent"), true);

// ===== When to pick which =====
// - Production code over arbitrary chars (Unicode, accents) → Approach 1.
// - One-liner readability for ASCII strings → Approach 2 (or 3).
// - Hot path with known fixed alphabet (e.g., DNA bases A/C/G/T) → Approach 3.`,

  'Longest Substring': `// ===== SOLUTION: Longest Substring Without Repeating =====
//
// ┌────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                           │ Time  │ Space │ Verdict    │
// ├────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Sliding window with index map   │ O(n)  │ O(k)  │ BEST       │
// │ 2. Sliding window with Set + shrink│ O(n)  │ O(k)  │ Cleaner    │
// │ 3. Brute force (every substring)   │ O(n³) │ O(k)  │ Don't ship │
// └────────────────────────────────────┴───────┴───────┴────────────┘
// k = size of charset (26 for lowercase English).

// ----- Approach 1: Sliding window with last-index map (BEST) -----
// On a repeat, jump left to the position AFTER the previous occurrence.
// Single pass, no inner loop — true O(n).
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}

// ----- Approach 2: Set + shrink-left (cleaner mental model) -----
// Add chars to a Set; on collision, shrink the window from the left
// until the offender is gone. Same O(n), arguably easier to explain.
function lengthOfLongestSubstringSet(s) {
  const seen = new Set();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left++]);
    }
    seen.add(s[right]);
    max = Math.max(max, right - left + 1);
  }
  return max;
}

// ----- Approach 3: Brute force (DON'T SHIP — O(n³)) -----
function lengthOfLongestSubstringBrute(s) {
  let max = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1);
      if (new Set(sub).size === sub.length) max = Math.max(max, sub.length);
    }
  }
  return max;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (index map) — BEST ---");
test("abcabcbb", lengthOfLongestSubstring("abcabcbb"), 3);
test("bbbbb",    lengthOfLongestSubstring("bbbbb"), 1);
test("pwwkew",   lengthOfLongestSubstring("pwwkew"), 3);
test("Empty",    lengthOfLongestSubstring(""), 0);
test("Unique",   lengthOfLongestSubstring("abcdef"), 6);

console.log("\\n--- Approach 2 (Set + shrink) — same outputs ---");
test("Set: pwwkew", lengthOfLongestSubstringSet("pwwkew"), 3);

// ===== When to pick which =====
// - Default → Approach 1. Jumps left in one step (vs shrinking). Faster constant.
// - Pedagogy / clarity in interviews → Approach 2. The "expand right, shrink
//   left until valid" pattern is the canonical sliding-window template.
// - Approach 3 demonstrates the "expand from naive O(n³)" → "to O(n) sliding"
//   improvement — useful talking-point setup in interviews.
//
// Sliding-window is one of the top-3 most-asked DSA patterns. Recognize it
// from the keywords: "longest", "smallest", "fixed-size", "subarray that...".`,

  'First Non-Repeating Char': `// ===== SOLUTION: First Non-Repeating Character =====
//
// ┌────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                           │ Time  │ Space │ Verdict    │
// ├────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Two-pass with frequency map     │ O(n)  │ O(k)  │ BEST       │
// │ 2. One-pass with insertion-ordered │ O(n)  │ O(k)  │ Stream-friendly │
// │    Map                             │       │       │            │
// │ 3. indexOf == lastIndexOf          │ O(n²) │ O(1)  │ Don't ship │
// └────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Two-pass frequency map (BEST clarity) -----
// Pass 1: count every char. Pass 2: scan in original order for count=1.
function firstNonRepeating(s) {
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of s) {
    if (freq[ch] === 1) return ch;
  }
  return null;
}

// ----- Approach 2: Insertion-ordered Map (one-pass, stream-friendly) -----
// JavaScript Map preserves insertion order. Track first-index per char,
// then iterate map at the end. Doesn't require a second pass over the
// string but does a single iteration over unique chars at the end.
function firstNonRepeatingMap(s) {
  const seen = new Map();   // char → { count, firstIndex }
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (seen.has(ch)) seen.get(ch).count++;
    else seen.set(ch, { count: 1, firstIndex: i });
  }
  let result = null, minIdx = Infinity;
  for (const [ch, { count, firstIndex }] of seen) {
    if (count === 1 && firstIndex < minIdx) {
      result = ch;
      minIdx = firstIndex;
    }
  }
  return result;
}

// ----- Approach 3: indexOf == lastIndexOf (DON'T SHIP — O(n²)) -----
function firstNonRepeatingSlow(s) {
  for (let i = 0; i < s.length; i++) {
    if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return s[i];
  }
  return null;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (two-pass) — BEST ---");
test("leetcode",     firstNonRepeating("leetcode"), "l");
test("loveleetcode", firstNonRepeating("loveleetcode"), "v");
test("All repeat",   firstNonRepeating("aabb"), null);
test("Single char",  firstNonRepeating("z"), "z");
test("Empty",        firstNonRepeating(""), null);

// ===== When to pick which =====
// - Default → Approach 1. Cleanest; second pass is over a string we already
//   have in memory anyway.
// - Streaming input (don't keep the whole string) → Approach 2 with index tracking.
// - Approach 3 looks "clever" but is quadratic; never use in real code.
//
// Why this is asked: tests two-pass thinking (count, then find). Common
// follow-up: "what if the string is a stream and you can't read it twice?"
// — that's the case for Approach 2.`,

  'Sum Curry': `// ===== SOLUTION: Sum Curry — sum(1)(2)(3)... =====
//
// ┌──────────────────────────────────────┬───────┬───────────────────┐
// │ Approach                             │ Style │ Verdict           │
// ├──────────────────────────────────────┼───────┼───────────────────┤
// │ 1. Closure with empty-call termination│ Explicit│ BEST clearest   │
// │ 2. valueOf override (implicit coerce) │ Trick │ Surprises readers │
// │ 3. toString override                  │ Trick │ Same as valueOf   │
// └──────────────────────────────────────┴───────┴───────────────────┘

// ----- Approach 1: Empty-call termination (BEST clarity) -----
// Inner function captures running total. Called with no args → returns total.
// Called with an arg → adds and returns itself for further chaining.
function sum(a) {
  let total = a;
  function inner(b) {
    if (b === undefined) return total;
    total += b;
    return inner;
  }
  return inner;
}

// ----- Approach 2: valueOf override (no terminator needed) -----
// The function ALSO acts as a number when used in arithmetic context.
// Trick: \`sum(1)(2)(3) + 0\` → 6 (no empty call required).
// Cute, but surprises readers — most don't expect a function to coerce.
function sumValueOf(a) {
  function inner(b) {
    if (b === undefined) return inner;
    inner.total = (inner.total || a) + b;
    return inner;
  }
  inner.valueOf = function () { return inner.total !== undefined ? inner.total : a; };
  return inner;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (empty-call) — BEST ---");
test("Two args",     sum(1)(2)(),          3);
test("Three args",   sum(1)(2)(3)(),       6);
test("Five args",    sum(1)(2)(3)(4)(5)(), 15);
test("Single arg",   sum(42)(),            42);
test("With zero",    sum(0)(0)(5)(),       5);

// ===== When to pick which =====
// - Default → Approach 1. Explicit terminator (empty call) is unambiguous.
// - Approach 2 is a JS-trivia favorite — interviewers sometimes ask:
//   "make sum(1)(2)(3) + 0 produce 6 directly." Answer is valueOf override.
// - Real-world currying: use a library like Ramda or lodash.curry. The
//   variadic "infinite chain" pattern almost never appears in production —
//   it exists primarily as an interview puzzle that probes closure mastery.
//
// What this tests: closures (the inner function captures \`total\`),
// recursion-via-self-return, and the terminator design choice.`,

  'Memoize': `// ===== SOLUTION: Memoize =====
//
// ┌───────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                              │ Args  │ Cache │ Verdict    │
// ├───────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. JSON.stringify(args) as key        │ Prims │ Map   │ BEST gen   │
// │ 2. Single-arg primitive key           │ 1 prim│ Map   │ Fastest    │
// │ 3. WeakMap nested for object args     │ Obj   │ WeakMap│ Mem-safe  │
// │ 4. Tuple-tree nested Maps             │ Mixed │ Map tree│ Most general│
// └───────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: JSON.stringify key (BEST general-purpose) -----
// Works for any JSON-serializable args (strings, numbers, plain objects).
// Caveats: doesn't distinguish \`undefined\` from missing; can't serialize
// circular refs, functions, Dates correctly. Fine for most use cases.
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// ----- Approach 2: Single primitive arg (FASTEST when applicable) -----
// Skip the JSON.stringify cost entirely. Use the arg directly as Map key.
// Only works when fn takes exactly one primitive arg.
function memoizeSingle(fn) {
  const cache = new Map();
  return function (arg) {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn.call(this, arg);
    cache.set(arg, result);
    return result;
  };
}

// ----- Approach 3: WeakMap for object args (memory-safe) -----
// JSON.stringify can't reliably key by object identity. WeakMap can —
// AND lets the cache entry be garbage-collected if the object goes away.
// Critical for memoizing fns that take big React props or DOM nodes.
function memoizeWeak(fn) {
  const cache = new WeakMap();
  return function (obj) {
    if (cache.has(obj)) return cache.get(obj);
    const result = fn.call(this, obj);
    cache.set(obj, result);
    return result;
  };
}

// ===== TEST CASES =====
let computeCount = 0;
const slowDouble = (n) => { computeCount++; return n * 2; };
const fastDouble = memoize(slowDouble);

console.log(fastDouble(5));   // 10  (computed)
console.log(fastDouble(5));   // 10  (cached)
console.log(fastDouble(7));   // 14  (computed)
console.log(fastDouble(5));   // 10  (cached)

console.log(computeCount === 2 ? "✅" : "❌", "Cache hit count: expected 2 computes, got", computeCount);

// ===== When to pick which =====
// - General-purpose memoize → Approach 1 (JSON.stringify).
// - Single-arg, hot path (e.g., Fibonacci) → Approach 2 (direct primitive key).
// - Function takes a heavy object → Approach 3 (WeakMap by identity).
//   Critically, the WeakMap allows garbage collection when the object
//   goes out of scope — a regular Map would leak.
// - Multiple object args → Approach 4 (tuple-tree of nested Maps);
//   build it with WeakMap-of-WeakMap-of-... per arg position.
//
// React's useMemo / useCallback are NOT memoize — they cache by render,
// not by argument. If you need true argument-based memoization in React,
// use Approach 1 inside useMemo, or use a library like reselect.`,

  'Deep Clone': `// ===== SOLUTION: Deep Clone =====
//
// ┌──────────────────────────────────────┬───────┬─────────────────────────┐
// │ Approach                             │ Cycles│ Verdict                 │
// ├──────────────────────────────────────┼───────┼─────────────────────────┤
// │ 1. Recursion + WeakMap cycle guard   │ Yes   │ BEST manual             │
// │ 2. structuredClone (native)          │ Yes   │ USE THIS in production  │
// │ 3. JSON.parse(JSON.stringify(x))     │ NO    │ Quick but lossy         │
// │ 4. lodash.cloneDeep                  │ Yes   │ Battle-tested           │
// └──────────────────────────────────────┴───────┴─────────────────────────┘

// ----- Approach 1: Recursive with WeakMap (BEST for "implement it") -----
// Handles plain objects, arrays, Date, RegExp, and CYCLES (a → b → a).
// WeakMap maps original→clone so we don't infinite-loop or duplicate.
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);   // cycle guard

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value);

  if (Array.isArray(value)) {
    const copy = [];
    seen.set(value, copy);
    for (const item of value) copy.push(deepClone(item, seen));
    return copy;
  }

  const copy = {};
  seen.set(value, copy);
  for (const key of Object.keys(value)) {
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}

// ----- Approach 2: Native structuredClone (USE IN PRODUCTION) -----
// Browser- and Node-native (16.0+). Handles Map, Set, Date, RegExp, Blob,
// File, ArrayBuffer, typed arrays, AND cycles. Doesn't handle: functions,
// DOM nodes, Symbols, class instances (they become plain objects).
function deepCloneNative(value) {
  return structuredClone(value);
}

// ----- Approach 3: JSON round-trip (DON'T SHIP — lossy) -----
// One-line, but: drops undefined, functions, symbols; turns Date into
// string; doesn't handle cycles (throws). Quick-and-dirty for plain JSON.
function deepCloneJSON(value) {
  return JSON.parse(JSON.stringify(value));
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

const original = { a: 1, b: { c: 2, d: [3, 4, { e: 5 }] } };
const cloned = deepClone(original);
cloned.b.c = 999;
cloned.b.d[2].e = 999;

test("Top level unchanged", original.b.c, 2);
test("Nested array unchanged", original.b.d[2].e, 5);
test("Cloned mutation works", cloned.b.c, 999);
test("Cloned array mutation works", cloned.b.d[2].e, 999);
test("Different reference", original === cloned, false);

// ===== When to pick which =====
// - Production code → Approach 2 (structuredClone). Native, handles
//   Map/Set/Date/typed-arrays correctly, including cycles. Browser+Node 16+.
// - Interview "implement deepClone" → Approach 1. Shows you understand
//   recursion, WeakMap for cycles, type-specific handling for Date/RegExp.
// - Plain-JSON-only data and you can't rely on structuredClone → Approach 3.
//   Fastest in raw cycles, but silently drops undefined/functions/symbols.
// - Class instances or fn properties → use a library (lodash.cloneDeep)
//   or manually preserve prototypes — structuredClone strips them.
//
// Why this is asked: tests recursion, type-checking, cycle handling
// (the WeakMap trick), and awareness of the JSON round-trip pitfalls.`,

  'Throttle': `// ===== SOLUTION: Throttle =====
//
// Throttle ensures fn fires AT MOST once per limit ms. Different from
// debounce: throttle fires throughout a burst at a steady rate; debounce
// only fires once after the burst ends.
//
// ┌────────────────────────────────────┬────────────────────┬────────────┐
// │ Approach (variant)                 │ Behavior           │ Verdict    │
// ├────────────────────────────────────┼────────────────────┼────────────┤
// │ 1. Timestamp-based (leading edge)  │ First call fires   │ DEFAULT    │
// │ 2. Timer-based (trailing edge)     │ Last call fires    │ Cleaner    │
// │ 3. Both edges (lodash style)       │ First + last       │ Most flex  │
// └────────────────────────────────────┴────────────────────┴────────────┘

// ----- Approach 1: Timestamp-based, leading edge (most common) -----
// First call within a window fires immediately; subsequent calls inside
// the window are silently dropped. Most efficient (no setTimeout).
function throttle(fn, limit) {
  let lastFire = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastFire >= limit) {
      lastFire = now;
      fn.apply(this, args);
    }
  };
}

// ----- Approach 2: Timer-based, trailing edge -----
// First call schedules a fire after limit ms; subsequent calls within
// the window update the args but don't reschedule. Useful when you want
// the LATEST args from a burst rather than the first.
function throttleTrailing(fn, limit) {
  let timer = null;
  let lastArgs;
  return function (...args) {
    lastArgs = args;
    if (timer === null) {
      timer = setTimeout(() => {
        fn.apply(this, lastArgs);
        timer = null;
      }, limit);
    }
  };
}

// ----- Approach 3: Both edges (lodash-style) -----
// Fires immediately AND once at the end of a burst — covers both intents.
function throttleBothEdges(fn, limit) {
  let lastFire = 0;
  let timer = null;
  return function (...args) {
    const now = Date.now();
    const remaining = limit - (now - lastFire);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastFire = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastFire = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// ===== TEST CASES =====
let count = 0;
const throttled = throttle(() => count++, 100);

throttled();  // fires (count=1)
throttled();  // throttled
throttled();  // throttled

setTimeout(() => {
  throttled();  // fires (count=2) — past the window
  setTimeout(() => {
    console.log(count === 2 ? "✅" : "❌", \`Expected 2 calls, got \${count}\`);
  }, 50);
}, 150);

// ===== When to pick which =====
// - Scroll handler, mouse-move, resize → Approach 1 (leading edge).
//   You want a steady response rate; the first event in each window fires.
// - Auto-save / send-update with latest data → Approach 2 (trailing).
//   The latest args matter, not the first.
// - Lodash _.throttle compat → Approach 3 (both edges).
//
// Throttle vs debounce:
// - Throttle: 10 calls in 1 sec at 100ms throttle → ~10 fires (one per window).
// - Debounce: 10 calls in 1 sec at 100ms debounce → 1 fire (after the burst ends).
//
// Use throttle for "I want a steady rate even during the burst."
// Use debounce for "I only want to act after the user stops."`,

  'EventEmitter': `// ===== SOLUTION: EventEmitter =====
//
// ┌──────────────────────────────────────┬──────────┬───────┬────────────┐
// │ Approach                             │ Add/Off  │ Dedup │ Verdict    │
// ├──────────────────────────────────────┼──────────┼───────┼────────────┤
// │ 1. Map<event, Set<fn>>               │ O(1)     │ Auto  │ BEST       │
// │ 2. Map<event, Array<fn>>             │ O(1)/O(n)│ No    │ Allows dups│
// │ 3. Plain object of arrays            │ O(1)/O(n)│ No    │ Pre-Map era│
// └──────────────────────────────────────┴──────────┴───────┴────────────┘

// ----- Approach 1: Map of Sets (BEST) -----
// Set gives O(1) add/has/delete and dedups automatically — registering
// the same listener twice doesn't fire it twice. Map preserves event
// names of any type (string, symbol, etc.).
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);   // return an unsubscriber
  }

  off(event, fn) {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event, ...args) {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }

  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn(...args);
    };
    this.on(event, wrapper);
  }
}

// ----- Approach 2: Map of Arrays (when duplicate registration is desired) -----
// Some pub/sub semantics want "if you subscribe twice, you receive the
// event twice." Use an array; off() removes one instance per call.
class EventEmitterArray {
  constructor() { this.listeners = new Map(); }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    const arr = this.listeners.get(event);
    if (!arr) return;
    const idx = arr.indexOf(fn);   // O(n) — Set's downside disappears here
    if (idx !== -1) arr.splice(idx, 1);
  }
  emit(event, ...args) {
    // Snapshot before iterating in case a listener mutates the array
    [...(this.listeners.get(event) || [])].forEach(fn => fn(...args));
  }
}

// ===== TEST CASES =====
const ee = new EventEmitter();
let calls = [];
const handler = (x) => calls.push(x);

ee.on("evt", handler);
ee.emit("evt", 1);
ee.emit("evt", 2);
ee.off("evt", handler);
ee.emit("evt", 3);

console.log(JSON.stringify(calls) === "[1,2]" ? "✅" : "❌", "on/off/emit:", calls);

let onceCount = 0;
ee.once("solo", () => onceCount++);
ee.emit("solo");
ee.emit("solo");
ee.emit("solo");

console.log(onceCount === 1 ? "✅" : "❌", \`once should fire 1x, fired \${onceCount}x\`);

// ===== When to pick which =====
// - Default → Approach 1 (Map of Sets). Auto-dedup, O(1) on every operation.
// - Need duplicate registrations to fire multiply → Approach 2 (Map of Arrays).
//   The .indexOf cost on .off() is acceptable when listener counts are small.
// - The platform's own EventTarget (DOM addEventListener) implements this
//   contract — you're essentially reimplementing what the browser ships.
//
// Why used: pub/sub is the foundation of many architectures (Redux store
// subscribers, RxJS Observables, WebSocket reconnect listeners). The interview
// tests Map/Set fluency, closure-based unsubscribe pattern, and the once()
// implementation (which probes "wrap fn to remove on first call").`,

  'LRU Cache': `// ===== SOLUTION: LRU Cache =====
//
// ┌──────────────────────────────────────┬─────────┬─────────┬────────────┐
// │ Approach                             │ get/put │ Code    │ Verdict    │
// ├──────────────────────────────────────┼─────────┼─────────┼────────────┤
// │ 1. Map (insertion-order trick)       │ O(1)    │ ~20 lines│ BEST in JS │
// │ 2. Doubly-linked list + Map          │ O(1)    │ ~80 lines│ Textbook  │
// │ 3. Object + array (manual order)     │ O(n)    │ medium  │ Don't ship │
// └──────────────────────────────────────┴─────────┴─────────┴────────────┘

// ----- Approach 1: Map insertion-order trick (BEST in JavaScript) -----
// JavaScript Map preserves INSERTION ORDER. To mark a key as most-recent,
// delete and re-insert it (it goes to the end). To evict LRU, take the
// first key from the Map's iterator. Both ops are O(1).
//
// This is the JS-specific shortcut that the textbook DLL+Map approach
// would otherwise require ~80 lines for. Senior interviewers love seeing it.
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);   // re-insert as most recent
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }
  }
}

// ----- Approach 2: Doubly-linked list + HashMap (canonical textbook) -----
// What every DSA textbook teaches. The DLL gives O(1) move-to-front and
// remove-from-tail; the HashMap gives O(1) lookup of nodes by key.
// More code, same complexity, but useful in languages without insertion-
// ordered hash maps (most pre-2015 languages).
class LRUCacheDLL {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();           // key → node
    this.head = { prev: null, next: null };   // sentinels
    this.tail = { prev: this.head, next: null };
    this.head.next = this.tail;
  }

  _addToFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._addToFront(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this._remove(node);
      this._addToFront(node);
      return;
    }
    const node = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this._addToFront(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}

// ===== TEST CASES =====
const cache = new LRUCache(2);
cache.put(1, "a");
cache.put(2, "b");
console.log(cache.get(1));    // "a" — now most-recent
cache.put(3, "c");            // evicts key 2
console.log(cache.get(2));    // -1 (evicted)
console.log(cache.get(3));    // "c"
cache.put(4, "d");            // evicts key 1 (since 3 is most-recent)
console.log(cache.get(1));    // -1
console.log(cache.get(3));    // "c"
console.log(cache.get(4));    // "d"

// ===== When to pick which =====
// - JavaScript / Python (3.7+) / any language with ordered Map/Dict →
//   Approach 1. Cleanest, fewer bugs, same O(1) complexity.
// - Java (LinkedHashMap with accessOrder=true is the equivalent), C++,
//   Go, languages without insertion-ordered hashes → Approach 2 (DLL+Map).
// - Approach 3 (object + array shifting) is what beginners reach for and
//   is O(n) on every operation — never use in production.
//
// Real-world LRU caches: HTTP caches, database query caches, image caches,
// the OS's page cache. Knowing this O(1) data structure matters in any
// system-design discussion involving "most recently used" eviction.`,

  'Binary Search': `// ===== SOLUTION: Binary Search =====
//
// ┌──────────────────────────────────┬──────────┬───────┬──────────┐
// │ Approach                         │ Time     │ Space │ Verdict  │
// ├──────────────────────────────────┼──────────┼───────┼──────────┤
// │ 1. Iterative (left/right)        │ O(log n) │ O(1)  │ BEST     │
// │ 2. Recursive                     │ O(log n) │ O(log n) stack │ Elegant  │
// │ 3. Linear scan                   │ O(n)     │ O(1)  │ Don't ship │
// └──────────────────────────────────┴──────────┴───────┴──────────┘

// ----- Approach 1: Iterative (BEST: O(1) extra space) -----
// Avoids \`(left + right) / 2\` overflow risk on huge arrays:
// (left + right) can be > MAX_SAFE_INTEGER when array length is big.
// Use \`left + Math.floor((right - left) / 2)\` for safety.
function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// ----- Approach 2: Recursive (elegant; stack frames cost O(log n)) -----
function binarySearchRecursive(nums, target, left = 0, right = nums.length - 1) {
  if (left > right) return -1;
  const mid = left + Math.floor((right - left) / 2);
  if (nums[mid] === target) return mid;
  if (nums[mid] < target) return binarySearchRecursive(nums, target, mid + 1, right);
  return binarySearchRecursive(nums, target, left, mid - 1);
}

// ----- Approach 3: Linear scan (DON'T SHIP — defeats the purpose) -----
function linearSearch(nums, target) {
  for (let i = 0; i < nums.length; i++) if (nums[i] === target) return i;
  return -1;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (iterative) — BEST ---");
test("Found in middle",  binarySearch([-1, 0, 3, 5, 9, 12], 9), 4);
test("Not found",        binarySearch([-1, 0, 3, 5, 9, 12], 2), -1);
test("First element",    binarySearch([1, 2, 3, 4, 5], 1), 0);
test("Last element",     binarySearch([1, 2, 3, 4, 5], 5), 4);
test("Empty array",      binarySearch([], 5), -1);
test("Single element",   binarySearch([42], 42), 0);

console.log("\\n--- Approach 2 (recursive) — same outputs ---");
test("Recursive: middle", binarySearchRecursive([-1, 0, 3, 5, 9, 12], 9), 4);

// ===== When to pick which =====
// - Always Approach 1 in production: avoids stack growth, no overflow risk.
// - Approach 2 is good for explaining the recursive structure in interviews.
// - Approach 3 is what you do when array is unsorted — note that you must
//   sort first (O(n log n)) before binary search makes sense.
//
// Watch out for the \`(left + right) / 2\` overflow on TypedArrays — use
// \`left + ((right - left) >>> 1)\` for the bit-shift version.`,

  'Roman to Integer': `// ===== SOLUTION: Roman to Integer =====
//
// ┌──────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                             │ Time  │ Space │ Verdict    │
// ├──────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Left-to-right with peek           │ O(n)  │ O(1)  │ BEST       │
// │ 2. Right-to-left running max         │ O(n)  │ O(1)  │ Cleanest   │
// │ 3. Replace special pairs first       │ O(n)  │ O(n)  │ Readable   │
// └──────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Left-to-right with peek (BEST clarity) -----
// If current < next, this is a subtractive pair (IV, IX, XL, etc.):
// subtract current. Otherwise add current.
function romanToInt(s) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const curr = map[s[i]];
    const next = map[s[i + 1]] ?? 0;
    if (curr < next) total -= curr;
    else total += curr;
  }
  return total;
}

// ----- Approach 2: Right-to-left, track running max (cleanest) -----
// Walk from the right. Maintain max-seen-so-far. If current >= max, add;
// otherwise subtract. No need to peek the next character.
function romanToIntRight(s) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0, maxRight = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const v = map[s[i]];
    if (v >= maxRight) { total += v; maxRight = v; }
    else total -= v;
  }
  return total;
}

// ----- Approach 3: Replace special pairs first (most readable) -----
// Substitute the 6 subtractive pairs ("IV"→"IIII") so that the rest is
// just "sum the values." Allocates a new string but is dead-easy to read.
function romanToIntReplace(s) {
  s = s
    .replace("IV", "IIII").replace("IX", "VIIII")
    .replace("XL", "XXXX").replace("XC", "LXXXX")
    .replace("CD", "CCCC").replace("CM", "DCCCC");
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  return [...s].reduce((sum, ch) => sum + map[ch], 0);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (peek next) — BEST ---");
test("III",     romanToInt("III"),     3);
test("LVIII",   romanToInt("LVIII"),   58);
test("MCMXCIV", romanToInt("MCMXCIV"), 1994);
test("IV",      romanToInt("IV"),      4);
test("XL",      romanToInt("XL"),      40);

console.log("\\n--- Approach 2 (right-to-left max) — same outputs ---");
test("Right: MCMXCIV", romanToIntRight("MCMXCIV"), 1994);

// ===== When to pick which =====
// - Default → Approach 1. Most readable; requires only single-char peek.
// - "Most elegant" code → Approach 2. No peek, just track running max.
// - Pedagogy / explaining the special-pair rule → Approach 3.
//
// Why this is asked: tests dictionary lookup, the "look one ahead" pattern
// for handling subtractive notation, and edge-case awareness (last char
// has no "next" — handle nullish access).`,

  'Reverse Linked List': `// ===== SOLUTION: Reverse Linked List =====
//
// ┌────────────────────────────────────┬───────┬──────────┬────────────┐
// │ Approach                           │ Time  │ Space    │ Verdict    │
// ├────────────────────────────────────┼───────┼──────────┼────────────┤
// │ 1. Iterative three-pointer         │ O(n)  │ O(1)     │ BEST       │
// │ 2. Recursive                       │ O(n)  │ O(n) stack│ Stack risk│
// │ 3. Build new list / array reverse  │ O(n)  │ O(n)     │ Don't ship │
// └────────────────────────────────────┴───────┴──────────┴────────────┘

// ----- Approach 1: Iterative three-pointer (BEST: O(1) extra space) -----
// Walk forward, flipping each .next backwards. Three pointers (prev, curr, next)
// are the canonical pattern. The interviewer's expected answer.
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

// ----- Approach 2: Recursive (elegant; risks stack overflow on long lists) -----
// "Reverse the rest, then flip the link at this node."
// O(n) stack frames — for a list of 10k+, you'll blow the JS stack.
function reverseListRecursive(head) {
  if (!head || !head.next) return head;
  const newHead = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}

// ----- Approach 3: Build new list / convert to array (DON'T SHIP) -----
// Allocates O(n) extra. Defeats the point of doing it in-place.
function reverseListArray(head) {
  const values = [];
  let curr = head;
  while (curr) { values.push(curr.val); curr = curr.next; }
  values.reverse();
  // rebuild list
  let newHead = null;
  for (let i = values.length - 1; i >= 0; i--) newHead = { val: values[i], next: newHead };
  return newHead;
}

// ===== HELPERS (build/render lists for testing) =====
function fromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = { val: arr[i], next: head };
  return head;
}
function toArray(head) {
  const out = [];
  while (head) { out.push(head.val); head = head.next; }
  return out;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("1->2->3",     toArray(reverseList(fromArray([1, 2, 3]))), [3, 2, 1]);
test("Single node", toArray(reverseList(fromArray([42]))),     [42]);
test("Empty list",  toArray(reverseList(null)),                 []);
test("Long list",   toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);

// ===== When to pick which =====
// - Default → Approach 1 (iterative). O(1) space, no stack risk.
// - Whiteboard pedagogy / explaining the recursion structure → Approach 2.
// - Approach 3 is what someone unfamiliar with linked-list manipulation
//   reaches for; never use it.
//
// Why this is asked: linked-list reversal is the "hello world" of pointer
// manipulation. Tests three-pointer pattern fluency, awareness that
// linked-list problems are fundamentally about updating .next pointers
// (not values), and recognition that recursion's stack cost matters.`,

  'Container With Most Water': `// ===== SOLUTION: Container With Most Water =====
//
// ┌────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                           │ Time  │ Space │ Verdict    │
// ├────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Two-pointer (move shorter side) │ O(n)  │ O(1)  │ BEST       │
// │ 2. Brute force (every pair)        │ O(n²) │ O(1)  │ Don't ship │
// └────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Two-pointer (BEST) -----
// The shorter side limits the area; moving it inward is the only direction
// that could yield a larger area. Moving the taller side never helps
// (width shrinks, height capped by the still-shorter side).
function maxArea(heights) {
  let left = 0, right = heights.length - 1;
  let max = 0;
  while (left < right) {
    const h = Math.min(heights[left], heights[right]);
    const area = h * (right - left);
    if (area > max) max = area;
    if (heights[left] < heights[right]) left++;
    else right--;
  }
  return max;
}

// ----- Approach 2: Brute force (DON'T SHIP — O(n²)) -----
// Tries every pair. Useful only as the baseline in an interview to motivate
// the two-pointer optimization.
function maxAreaBrute(heights) {
  let max = 0;
  for (let i = 0; i < heights.length; i++) {
    for (let j = i + 1; j < heights.length; j++) {
      const area = Math.min(heights[i], heights[j]) * (j - i);
      if (area > max) max = area;
    }
  }
  return max;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (two-pointer) — BEST ---");
test("Standard",  maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
test("Two bars",  maxArea([1, 1]),                       1);
test("Same",      maxArea([4, 4, 4, 4]),                 12);
test("Increasing", maxArea([1, 2, 3, 4, 5]),             6);
test("Single",    maxArea([5]),                          0);

console.log("\\n--- Approach 2 (brute force) — same outputs, O(n²) ---");
test("Brute: standard", maxAreaBrute([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);

// ===== When to pick which =====
// - Always Approach 1 in production / interview answers.
// - Approach 2 is the "naive" baseline: useful in an interview to mention
//   you considered it, then explain why two-pointer is provably correct
//   (moving the shorter side is the only direction that could improve).`,

  'Climbing Stairs': `// ===== SOLUTION: Climbing Stairs =====
//
// ┌────────────────────────────────────┬───────┬───────┬────────────────┐
// │ Approach                           │ Time  │ Space │ Verdict        │
// ├────────────────────────────────────┼───────┼───────┼────────────────┤
// │ 1. Bottom-up DP, two variables     │ O(n)  │ O(1)  │ BEST           │
// │ 2. Bottom-up DP, dp array          │ O(n)  │ O(n)  │ Easier to read │
// │ 3. Memoized recursion (top-down)   │ O(n)  │ O(n)  │ Stack frames   │
// │ 4. Naive recursion                 │ O(2^n)│ O(n)  │ Don't ship     │
// │ 5. Closed-form (Binet's formula)   │ O(1)  │ O(1)  │ Math-y; precision risk │
// └────────────────────────────────────┴───────┴───────┴────────────────┘
//
// Recognize the pattern: this IS Fibonacci. f(n) = f(n-1) + f(n-2).

// ----- Approach 1: Bottom-up DP, O(1) space (BEST) -----
function climbStairs(n) {
  if (n <= 2) return n;
  let prev1 = 2, prev2 = 1;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

// ----- Approach 2: DP array (easier to step through) -----
function climbStairsDP(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1);
  dp[1] = 1; dp[2] = 2;
  for (let i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}

// ----- Approach 3: Memoized recursion -----
function climbStairsMemo(n, memo = {}) {
  if (n <= 2) return n;
  if (memo[n]) return memo[n];
  memo[n] = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  return memo[n];
}

// ----- Approach 4: Naive recursion (DON'T SHIP — exponential time) -----
// O(2^n). For n=40, ~1 billion calls. Useful only as the "before optimization"
// answer in interviews to demonstrate why memoization matters.
function climbStairsNaive(n) {
  if (n <= 2) return n;
  return climbStairsNaive(n - 1) + climbStairsNaive(n - 2);
}

// ----- Approach 5: Binet's formula (O(1) but loses precision for n > ~70) -----
function climbStairsBinet(n) {
  const sqrt5 = Math.sqrt(5);
  const phi = (1 + sqrt5) / 2;
  const psi = (1 - sqrt5) / 2;
  return Math.round((Math.pow(phi, n + 1) - Math.pow(psi, n + 1)) / sqrt5);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (bottom-up, O(1) space) — BEST ---");
test("n = 1",  climbStairs(1), 1);
test("n = 2",  climbStairs(2), 2);
test("n = 3",  climbStairs(3), 3);
test("n = 4",  climbStairs(4), 5);
test("n = 5",  climbStairs(5), 8);
test("n = 10", climbStairs(10), 89);

console.log("\\n--- Approach 3 (memoized recursion) — same outputs ---");
test("Memo: n=10", climbStairsMemo(10), 89);

console.log("\\n--- Approach 5 (Binet's formula) — O(1) but precision-limited ---");
test("Binet: n=10", climbStairsBinet(10), 89);

// ===== When to pick which =====
// - Default → Approach 1. O(1) space, smallest constant factors.
// - Walkthrough / pedagogy → Approach 2 (dp array shows the table).
// - Top-down "natural" recursion preference → Approach 3 (memoized).
// - Approach 4 is the "before" of optimization-discussion in interviews.
// - Approach 5 is the math-flex; loses precision for n above ~70 because
//   floating-point error in φ^n exceeds the integer step.`,

  'Balanced Brackets (Count)': `// ===== SOLUTION: Balanced Brackets — Count Match =====
// Multiple approaches. The first is the most performant; the rest
// are shown for completeness and trade-offs.
//
// ┌────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                   │ Time  │ Space │ Verdict    │
// ├────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Per-pair counters       │ O(n)  │ O(1)  │ BEST perf  │
// │ 2. Hash map of counts      │ O(n)  │ O(k)  │ Cleanest   │
// │ 3. Stack (push opens, pop) │ O(n)  │ O(n)  │ Wasteful   │
// │ 4. Regex / split+filter    │ O(n·k)│ O(n)  │ Concise    │
// └────────────────────────────┴───────┴───────┴────────────┘
// k = number of bracket types (3 here).

// ----- Approach 1: Per-pair counters (BEST: lowest constant factors) -----
function isBalancedByCount(str) {
  let p = 0, b = 0, c = 0;          // ( [ {
  for (const ch of str) {
    if      (ch === '(') p++;
    else if (ch === ')') p--;
    else if (ch === '[') b++;
    else if (ch === ']') b--;
    else if (ch === '{') c++;
    else if (ch === '}') c--;
  }
  return p === 0 && b === 0 && c === 0;
}

// ----- Approach 2: Hash map (cleanest; scales to many bracket types) -----
function isBalancedByCountMap(str) {
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const counts = {};
  for (const ch of str) {
    if (ch in pairs)            counts[ch] = (counts[ch] || 0) + 1;
    else if (Object.values(pairs).includes(ch)) counts[ch] = (counts[ch] || 0) + 1;
  }
  for (const [open, close] of Object.entries(pairs)) {
    if ((counts[open] || 0) !== (counts[close] || 0)) return false;
  }
  return true;
}

// ----- Approach 3: Stack (allocates per push — O(n) extra memory) -----
function isBalancedByCountStack(str) {
  const opens = [];
  const closes = [];
  for (const ch of str) {
    if      ('([{'.includes(ch)) opens.push(ch);
    else if (')]}'.includes(ch)) closes.push(ch);
  }
  return opens.filter(c => c === '(').length === closes.filter(c => c === ')').length
      && opens.filter(c => c === '[').length === closes.filter(c => c === ']').length
      && opens.filter(c => c === '{').length === closes.filter(c => c === '}').length;
}

// ----- Approach 4: Regex / match (most concise; multiple passes) -----
function isBalancedByCountRegex(str) {
  const cnt = (re) => (str.match(re) || []).length;
  return cnt(/\\(/g) === cnt(/\\)/g)
      && cnt(/\\[/g) === cnt(/\\]/g)
      && cnt(/{/g)   === cnt(/}/g);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (counters) — BEST ---");
test("Properly nested",       isBalancedByCount("(([]))"),  true);
test("Unordered but balanced", isBalancedByCount("([)]"),    true);
test("Unbalanced parens",     isBalancedByCount("(("),       false);
test("Unbalanced brackets",   isBalancedByCount("[(])"),     false);
test("All three pairs",        isBalancedByCount("({[]})"),  true);
test("Letters mixed in",       isBalancedByCount("a(b[c]d)e"), true);
test("Empty string",           isBalancedByCount(""),        true);
test("Reversed order",         isBalancedByCount(")("),      true);

console.log("\\n--- Approach 2 (hash map) — same outputs ---");
test("Hash: nested",           isBalancedByCountMap("(([]))"), true);
test("Hash: unbalanced",       isBalancedByCountMap("(("),     false);

console.log("\\n--- Approach 4 (regex) — same outputs ---");
test("Regex: nested",          isBalancedByCountRegex("(([]))"), true);
test("Regex: all three",       isBalancedByCountRegex("({[]})"), true);

// ===== When to pick which =====
// - 3 bracket types, hot path → Approach 1 (counters): no allocations.
// - Many bracket types or dynamic config → Approach 2 (hash map).
// - Code golf / readability over perf → Approach 4 (regex).
// - Avoid Approach 3 (stack) for COUNT-only — it allocates without benefit.
//
// Reminder: this checks counts, NOT order. For order validation
// (rejecting "([)]"), use the classic stack-based "Valid Parentheses".`,

  'Second Largest Number': `// ===== SOLUTION: Second Largest Number (no sort) =====
//
// ┌─────────────────────────────────────┬───────┬───────┬────────────┐
// │ Approach                            │ Time  │ Space │ Verdict    │
// ├─────────────────────────────────────┼───────┼───────┼────────────┤
// │ 1. Single-pass two-variable tracking│ O(n)  │ O(1)  │ BEST       │
// │ 2. Two-pass (find max, then 2nd)    │ O(n)  │ O(1)  │ Readable   │
// │ 3. Set + reduce                     │ O(n)  │ O(n)  │ Cleanest   │
// │ 4. Min-heap of size 2               │ O(n)  │ O(1)  │ Overkill   │
// └─────────────────────────────────────┴───────┴───────┴────────────┘

// ----- Approach 1: Single-pass tracking (BEST: O(n) time, O(1) space) -----
function secondLargest(nums) {
  let largest = -Infinity;
  let second  = -Infinity;
  for (const n of nums) {
    if (n > largest) {
      second = largest;
      largest = n;
    } else if (n > second && n < largest) {
      second = n;
    }
  }
  return second === -Infinity ? null : second;
}

// ----- Approach 2: Two-pass (very readable, slightly slower) -----
function secondLargestTwoPass(nums) {
  if (nums.length < 2) return null;
  let max = -Infinity;
  for (const n of nums) if (n > max) max = n;
  let second = -Infinity;
  for (const n of nums) if (n > second && n < max) second = n;
  return second === -Infinity ? null : second;
}

// ----- Approach 3: Set + reduce (cleanest; O(n) extra space) -----
function secondLargestSet(nums) {
  const unique = [...new Set(nums)];
  if (unique.length < 2) return null;
  let largest = -Infinity, second = -Infinity;
  for (const n of unique) {
    if (n > largest) { second = largest; largest = n; }
    else if (n > second) { second = n; }
  }
  return second === -Infinity ? null : second;
}

// ----- Approach 4: Min-heap of size 2 (overkill for k=2; useful for k>2) -----
function secondLargestHeap(nums) {
  // Same as a sorted top-2 buffer for k=2; generalizes to top-K
  const top2 = [];
  for (const n of nums) {
    if (top2.length < 2) {
      top2.push(n);
      top2.sort((a, b) => a - b);    // tiny array; O(1) effectively
    } else if (n > top2[0] && !top2.includes(n)) {
      top2[0] = n;
      top2.sort((a, b) => a - b);
    }
  }
  return top2.length < 2 ? null : top2[0];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (single-pass) — BEST ---");
test("Basic",                secondLargest([3, 1, 4, 1, 5, 9, 2, 6]), 6);
test("Two distinct",          secondLargest([10, 5]),                  5);
test("All duplicates",        secondLargest([5, 5, 5]),                null);
test("Two of largest",        secondLargest([7, 7, 3]),                3);
test("Negatives",             secondLargest([-1, -3, -2, -5]),         -2);
test("With zero",             secondLargest([0, 0, 0, 1]),             0);
test("Single element",        secondLargest([42]),                     null);
test("Empty",                 secondLargest([]),                       null);

console.log("\\n--- Approach 2 (two-pass) — same outputs ---");
test("Two-pass: basic",       secondLargestTwoPass([3, 1, 4, 1, 5, 9, 2, 6]), 6);
test("Two-pass: duplicates",  secondLargestTwoPass([5, 5, 5]),                 null);

console.log("\\n--- Approach 3 (Set) — same outputs ---");
test("Set: basic",            secondLargestSet([3, 1, 4, 1, 5, 9, 2, 6]),     6);
test("Set: duplicates",       secondLargestSet([5, 5, 5]),                     null);

// ===== When to pick which =====
// - Hot path / stream of millions of numbers → Approach 1 (single-pass).
// - Code-review readability matters more than constant-factor → Approach 2.
// - "Second largest" generalizes to "top K" → Approach 4 (heap), where it
//   becomes O(n log K) and is the canonical pattern for K > 2.
// - Approach 3's Set is just a deduplication trick — useful if duplicates
//   are common AND you want the unique-values second largest.`,

  'Compose & Pipe': `// ===== SOLUTION: Compose & Pipe =====
//
// ┌──────────────────────────────────────┬───────┬────────────┐
// │ Approach                             │ Style │ Verdict    │
// ├──────────────────────────────────────┼───────┼────────────┤
// │ 1. reduce / reduceRight (1-line)     │ FP    │ BEST       │
// │ 2. Imperative for-loop               │ Imperative│ Verbose │
// │ 3. Recursive                         │ Recursive│ Stack risk│
// └──────────────────────────────────────┴───────┴────────────┘

// ----- Approach 1: reduce / reduceRight (BEST — idiomatic FP) -----
// compose: right-to-left  → compose(f, g, h)(x) = f(g(h(x)))
// pipe:    left-to-right  → pipe(f, g, h)(x)    = h(g(f(x)))
// Note: reduceRight starts from the LAST fn, so it's applied first.
function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

function pipe(...fns) {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

// ----- Approach 2: Imperative for-loop (more code, same result) -----
// Useful if a reviewer doesn't grok reduce/reduceRight; reads like a
// straightforward step-by-step pipeline.
function pipeFor(...fns) {
  return function (x) {
    let result = x;
    for (let i = 0; i < fns.length; i++) result = fns[i](result);
    return result;
  };
}

function composeFor(...fns) {
  return function (x) {
    let result = x;
    for (let i = fns.length - 1; i >= 0; i--) result = fns[i](result);
    return result;
  };
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

const double = (x) => x * 2;
const addOne = (x) => x + 1;
const square = (x) => x * x;

console.log("--- Approach 1 (reduce/reduceRight) — BEST ---");
test("compose right-to-left", compose(double, addOne)(3), 8);
test("pipe left-to-right",    pipe(double, addOne)(3), 7);
test("Three fns compose",     compose(square, double, addOne)(2), 36);
test("Three fns pipe",        pipe(square, double, addOne)(2), 9);
test("Single fn",             compose(double)(5), 10);

// ===== When to pick which =====
// - Default → Approach 1. Idiomatic FP, one line, clear intent.
// - Code-review where reduce/reduceRight is unfamiliar → Approach 2.
// - Avoid recursion: any fn pipeline of size > 10k blows the stack.
//
// Where these are used:
// - Redux: \`compose(applyMiddleware(...), DevTools.instrument())\` for store creation.
// - RxJS: \`source$.pipe(filter, map, debounce)\`.
// - lodash/Ramda: \`R.pipe(filter, map, sort)\`.
//
// pipe vs compose is just a direction preference; pipe reads naturally
// left-to-right ("first do A, then B, then C"), compose composes math-style.`,
};
