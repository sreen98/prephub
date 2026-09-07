const e={"Two Sum":`// ===== SOLUTION: Two Sum =====
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
//   recognize that the hash map turns O(n²) into O(n).`,"Reverse String":`// ===== SOLUTION: Reverse String =====
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
// - Approach 4 is a teaching baseline; never use in real code.`,"Valid Palindrome":`// ===== SOLUTION: Valid Palindrome =====
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
// - Quick code-golf answer in a non-perf-critical context → Approach 3.`,FizzBuzz:`// ===== SOLUTION: FizzBuzz =====
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
// and the awareness that "first match wins" matters when conditions overlap.`,"Max Profit":`// ===== SOLUTION: Max Profit (Best Time to Buy/Sell Stock) =====
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
// "I only ever need the minimum to my left, which I can track in one pass."`,"Valid Parentheses":`// ===== SOLUTION: Valid Parentheses =====
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
// bracket must be the next to close. That's the textbook stack signal.`,"Merge Sorted Arrays":`// ===== SOLUTION: Merge Sorted Arrays =====
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
// k-way merge for log aggregation, and stream-of-sorted-files merging.`,"Flatten Array":`// ===== SOLUTION: Flatten Array =====
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
// understanding of stack risk for deep recursion, and knowledge of ES2019+.`,Debounce:`// ===== SOLUTION: Debounce =====
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
// only after the user pauses, OR only on the first event of a burst.`,"Group Anagrams":`// ===== SOLUTION: Group Anagrams =====
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
// pattern (used in deduplication, equivalence-class problems, hashing).`,"Find Duplicates":`// ===== SOLUTION: Find Duplicates =====
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
// - Approach 4 is a teaching baseline only.`,"Remove Duplicates":`// ===== SOLUTION: Remove Duplicates =====
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
// "distinct values," "uniqueness-by-key" problems.`,"Find Missing Number":`// ===== SOLUTION: Find Missing Number =====
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
// - Approach 4 is a baseline; the sort dominates the cost.`,"Move Zeros":`// ===== SOLUTION: Move Zeros to End =====
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
// for in-place array compaction (filter, partition, dedup-in-place).`,"Rotate Array":`// ===== SOLUTION: Rotate Array =====
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
// trade-offs, and recognition of the reverse-three-times pattern.`,"Bubble Sort":`// ===== SOLUTION: Bubble Sort =====
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
// adjacent-swap idea is the foundation for understanding more complex sorts.`,"Quick Sort":`// ===== SOLUTION: Quick Sort =====
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
// common interview probe).`,"Merge Sort":`// ===== SOLUTION: Merge Sort =====
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
//   sort hybrid — so this is "what production sort actually does."`,"Anagram Check":`// ===== SOLUTION: Anagram Check =====
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
// - Hot path with known fixed alphabet (e.g., DNA bases A/C/G/T) → Approach 3.`,"Longest Substring":`// ===== SOLUTION: Longest Substring Without Repeating =====
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
// from the keywords: "longest", "smallest", "fixed-size", "subarray that...".`,"First Non-Repeating Char":`// ===== SOLUTION: First Non-Repeating Character =====
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
// — that's the case for Approach 2.`,"Sum Curry":`// ===== SOLUTION: Sum Curry — sum(1)(2)(3)... =====
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
// recursion-via-self-return, and the terminator design choice.`,Memoize:`// ===== SOLUTION: Memoize =====
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
// use Approach 1 inside useMemo, or use a library like reselect.`,"Deep Clone":`// ===== SOLUTION: Deep Clone =====
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
// (the WeakMap trick), and awareness of the JSON round-trip pitfalls.`,Throttle:`// ===== SOLUTION: Throttle =====
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
// Use debounce for "I only want to act after the user stops."`,EventEmitter:`// ===== SOLUTION: EventEmitter =====
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
// implementation (which probes "wrap fn to remove on first call").`,"LRU Cache":`// ===== SOLUTION: LRU Cache =====
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
// system-design discussion involving "most recently used" eviction.`,"Binary Search":`// ===== SOLUTION: Binary Search =====
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
// \`left + ((right - left) >>> 1)\` for the bit-shift version.`,"Roman to Integer":`// ===== SOLUTION: Roman to Integer =====
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
// has no "next" — handle nullish access).`,"Reverse Linked List":`// ===== SOLUTION: Reverse Linked List =====
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
// (not values), and recognition that recursion's stack cost matters.`,"Container With Most Water":`// ===== SOLUTION: Container With Most Water =====
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
//   (moving the shorter side is the only direction that could improve).`,"Climbing Stairs":`// ===== SOLUTION: Climbing Stairs =====
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
//   floating-point error in φ^n exceeds the integer step.`,"Balanced Brackets (Count)":`// ===== SOLUTION: Balanced Brackets — Count Match =====
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
// (rejecting "([)]"), use the classic stack-based "Valid Parentheses".`,"Second Largest Number":`// ===== SOLUTION: Second Largest Number (no sort) =====
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
//   are common AND you want the unique-values second largest.`,"Compose & Pipe":`// ===== SOLUTION: Compose & Pipe =====
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
// left-to-right ("first do A, then B, then C"), compose composes math-style.`,"Maximum Subarray":`// ===== SOLUTION: Maximum Subarray =====
//
// ┌────────────────────────────────┬───────┬───────┬──────────────┐
// │ Approach                       │ Time  │ Space │ Verdict      │
// ├────────────────────────────────┼───────┼───────┼──────────────┤
// │ 1. Kadane's (O(1) space)       │ O(n)  │ O(1)  │ BEST         │
// │ 2. Bottom-up DP (dp array)     │ O(n)  │ O(n)  │ Educational  │
// │ 3. Divide & conquer            │ O(n log n) │ O(log n) │ Showy │
// │ 4. Brute force (every i,j)     │ O(n²) │ O(1)  │ Don't ship   │
// └────────────────────────────────┴───────┴───────┴──────────────┘

// ----- Approach 1: Kadane's (BEST) -----
// At each i, the best subarray ENDING at i is either nums[i] alone,
// or nums[i] extended onto the best ending at i-1. Keep two scalars:
// current (best ending here) and best (best anywhere).
function maxSubArray(nums) {
  let current = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
}

// ----- Approach 2: Bottom-up DP with explicit array -----
// Same recurrence, dp[i] = max(nums[i], dp[i-1] + nums[i]).
function maxSubArrayDP(nums) {
  const dp = new Array(nums.length);
  dp[0] = nums[0];
  let best = dp[0];
  for (let i = 1; i < nums.length; i++) {
    dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
    best = Math.max(best, dp[i]);
  }
  return best;
}

// ----- Approach 3: Divide & conquer -----
// The max subarray is in left half, right half, or crosses the middle.
function maxSubArrayDC(nums, lo = 0, hi = nums.length - 1) {
  if (lo === hi) return nums[lo];
  const mid = (lo + hi) >> 1;
  const left = maxSubArrayDC(nums, lo, mid);
  const right = maxSubArrayDC(nums, mid + 1, hi);
  // Cross sum: extend left from mid and right from mid+1
  let lSum = -Infinity, sum = 0;
  for (let i = mid; i >= lo; i--) { sum += nums[i]; lSum = Math.max(lSum, sum); }
  let rSum = -Infinity; sum = 0;
  for (let i = mid + 1; i <= hi; i++) { sum += nums[i]; rSum = Math.max(rSum, sum); }
  return Math.max(left, right, lSum + rSum);
}

// ----- Approach 4: Brute force (BASELINE) -----
function maxSubArrayBrute(nums) {
  let best = nums[0];
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      best = Math.max(best, sum);
    }
  }
  return best;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${expected}, got \${actual}\`);
};

console.log("--- Approach 1 (Kadane's) — BEST ---");
test("Mixed",        maxSubArray([-2,1,-3,4,-1,2,1,-5,4]),  6);
test("All negative", maxSubArray([-3,-1,-2]),               -1);
test("Single",       maxSubArray([5]),                       5);
test("All positive", maxSubArray([1,2,3,4]),                10);

console.log("--- Approach 2 (DP array) ---");
test("Mixed (DP)",   maxSubArrayDP([-2,1,-3,4,-1,2,1,-5,4]), 6);

console.log("--- Approach 3 (Divide & conquer) ---");
test("Mixed (D&C)",  maxSubArrayDC([-2,1,-3,4,-1,2,1,-5,4]), 6);

// ===== When to pick which =====
// - DEFAULT → Kadane's. Single pass, O(1) space, the canonical answer.
// - DP array → same complexity, useful when you also need the actual
//   subarray (track endpoints alongside).
// - Divide & conquer → strictly worse, but the cross-sum trick teaches
//   "answer is in left, right, or crossing" which generalizes to harder
//   problems (Maximum Subarray Sum Circular, Segment Tree).
// - Brute force → never; just confirms correctness on tiny inputs.`,"Trapping Rain Water":`// ===== SOLUTION: Trapping Rain Water =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Two-pointer (O(1) space)      │ O(n)  │ O(1)  │ BEST      │
// │ 2. Pre-compute leftMax+rightMax  │ O(n)  │ O(n)  │ Easier read│
// │ 3. Monotonic stack               │ O(n)  │ O(n)  │ Niche     │
// │ 4. Brute force per index         │ O(n²) │ O(1)  │ Don't ship│
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Two-pointer (BEST) -----
// Water above i = min(maxLeft[i], maxRight[i]) - h[i].
// Move the SHORTER side inward; its running max IS the binding cap.
function trap(height) {
  let l = 0, r = height.length - 1, lMax = 0, rMax = 0, total = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      height[l] >= lMax ? (lMax = height[l]) : (total += lMax - height[l]);
      l++;
    } else {
      height[r] >= rMax ? (rMax = height[r]) : (total += rMax - height[r]);
      r--;
    }
  }
  return total;
}

// ----- Approach 2: Pre-compute leftMax / rightMax arrays -----
// Two passes to build the arrays, third pass to sum water. O(n) space.
function trapDP(height) {
  const n = height.length;
  if (n < 3) return 0;
  const left = new Array(n), right = new Array(n);
  left[0] = height[0];
  for (let i = 1; i < n; i++) left[i] = Math.max(left[i - 1], height[i]);
  right[n - 1] = height[n - 1];
  for (let i = n - 2; i >= 0; i--) right[i] = Math.max(right[i + 1], height[i]);
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.min(left[i], right[i]) - height[i];
  return total;
}

// ----- Approach 3: Monotonic stack -----
// Push indices in decreasing-height order. On a higher bar, pop and
// add the water trapped between the new bar and what's behind the popped one.
function trapStack(height) {
  const stack = [];
  let total = 0;
  for (let i = 0; i < height.length; i++) {
    while (stack.length && height[i] > height[stack[stack.length - 1]]) {
      const bottom = stack.pop();
      if (!stack.length) break;
      const left = stack[stack.length - 1];
      const width = i - left - 1;
      const bounded = Math.min(height[i], height[left]) - height[bottom];
      total += width * bounded;
    }
    stack.push(i);
  }
  return total;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${expected}, got \${actual}\`);
};
console.log("--- Approach 1 (Two-pointer) — BEST ---");
test("Classic", trap([0,1,0,2,1,0,1,3,2,1,2,1]), 6);
test("Plateau", trap([4,2,0,3,2,5]), 9);
test("Tiny",    trap([1,0,1]), 1);
test("Flat",    trap([2,2,2]), 0);
console.log("--- Approach 2 (DP arrays) ---");
test("Classic (DP)", trapDP([0,1,0,2,1,0,1,3,2,1,2,1]), 6);
console.log("--- Approach 3 (Monotonic stack) ---");
test("Classic (stack)", trapStack([0,1,0,2,1,0,1,3,2,1,2,1]), 6);

// ===== When to pick which =====
// - DEFAULT → Two-pointer. O(n) time + O(1) space, no allocation.
// - DP arrays → same time but easier to reason about; useful first draft
//   when explaining to an interviewer before optimizing space.
// - Stack → great if you want to track WHICH bars trap each unit, or for
//   variants like "Largest Rectangle in Histogram".
// - Brute force scans each index for max-left/max-right → O(n²); skip.`,"3Sum":`// ===== SOLUTION: 3Sum =====
//
// ┌──────────────────────────────┬───────────┬───────┬───────────┐
// │ Approach                     │ Time      │ Space │ Verdict   │
// ├──────────────────────────────┼───────────┼───────┼───────────┤
// │ 1. Sort + two-pointer        │ O(n²)     │ O(1)  │ BEST      │
// │ 2. Hash set inside loop      │ O(n²)     │ O(n)  │ More dedup│
// │ 3. Brute force (3 loops)     │ O(n³)     │ O(1)  │ Don't ship│
// └──────────────────────────────┴───────────┴───────┴───────────┘

// ----- Approach 1: Sort + two-pointer (BEST) -----
// Sort. Fix each i; two-pointer on the slice [i+1..n-1] for pairs
// summing to -nums[i]. Skip duplicates at every level.
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        out.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++; r--;
      } else if (s < 0) l++;
      else r--;
    }
  }
  return out;
}

// ----- Approach 2: Sort + hash set (alternative) -----
// Sort, then for each i, scan a hash set for the complement. Cleaner
// dedup logic but the same O(n²) time and extra O(n) memory.
function threeSumHash(nums) {
  nums.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    const seen = new Set();
    for (let j = i + 1; j < nums.length; j++) {
      const complement = -nums[i] - nums[j];
      if (seen.has(complement)) {
        out.push([nums[i], complement, nums[j]]);
        while (j + 1 < nums.length && nums[j + 1] === nums[j]) j++;
      }
      seen.add(nums[j]);
    }
  }
  return out;
}

// ===== TEST CASES =====
const norm = arrs => arrs.map(a => [...a].sort((x,y)=>x-y)).map(a => JSON.stringify(a)).sort();
const test = (name, actual, expected) => {
  console.log(JSON.stringify(norm(actual)) === JSON.stringify(norm(expected)) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Sort + two-pointer) — BEST ---");
test("Two triplets", threeSum([-1,0,1,2,-1,-4]), [[-1,-1,2], [-1,0,1]]);
test("All zeros",    threeSum([0,0,0,0]),         [[0,0,0]]);
test("No triplets",  threeSum([1,2,3]),           []);
console.log("--- Approach 2 (Sort + hash set) ---");
test("Two triplets (hash)", threeSumHash([-1,0,1,2,-1,-4]), [[-1,-1,2], [-1,0,1]]);

// ===== When to pick which =====
// - DEFAULT → Sort + two-pointer. O(1) extra space, easy to extend to
//   4Sum / kSum recursively (the two-pointer is the base of kSum).
// - Hash set → similar code structure; pick if you find two-pointer
//   off-by-ones harder than hash bookkeeping.
// - Brute force (3 loops) → demonstrates correctness but never ships.`,"Generate Parentheses":`// ===== SOLUTION: Generate Parentheses =====
//
// ┌──────────────────────────────────┬───────────────┬─────────┬──────────┐
// │ Approach                         │ Time          │ Space   │ Verdict  │
// ├──────────────────────────────────┼───────────────┼─────────┼──────────┤
// │ 1. Backtracking with counters    │ O(4ⁿ/√n)      │ O(n)    │ BEST     │
// │ 2. Iterative BFS                 │ O(4ⁿ/√n)      │ O(4ⁿ/√n)│ Equiv    │
// │ 3. Generate all + filter         │ O(2²ⁿ·n)      │ O(2²ⁿ)  │ Slow     │
// └──────────────────────────────────┴───────────────┴─────────┴──────────┘

// ----- Approach 1: Backtracking (BEST) -----
// Build the string one char at a time. Add '(' if open<n; add ')' if
// close<open. Length 2n → push. Pruning ensures only valid strings ever
// appear in the tree, so no validation step is needed.
function generate(n) {
  const out = [];
  function back(s, open, close) {
    if (s.length === 2 * n) { out.push(s); return; }
    if (open < n) back(s + "(", open + 1, close);
    if (close < open) back(s + ")", open, close + 1);
  }
  back("", 0, 0);
  return out;
}

// ----- Approach 2: Iterative BFS -----
// Start with [""]. At each step, for each existing partial, branch
// into '(' (if open<n) and ')' (if close<open). Same complexity, no
// recursion stack.
function generateBFS(n) {
  if (n === 0) return [""];
  let frontier = [{ s: "", open: 0, close: 0 }];
  const out = [];
  while (frontier.length) {
    const next = [];
    for (const { s, open, close } of frontier) {
      if (s.length === 2 * n) { out.push(s); continue; }
      if (open < n) next.push({ s: s + "(", open: open + 1, close });
      if (close < open) next.push({ s: s + ")", open, close: close + 1 });
    }
    frontier = next;
  }
  return out;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort()) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Backtracking) — BEST ---");
test("n=1", generate(1), ["()"]);
test("n=2", generate(2), ["(())", "()()"]);
test("n=3", generate(3), ["((()))","(()())","(())()","()(())","()()()"]);
test("n=0", generate(0), [""]);
console.log("--- Approach 2 (Iterative BFS) ---");
test("n=3 (BFS)", generateBFS(3), ["((()))","(()())","(())()","()(())","()()()"]);

// ===== When to pick which =====
// - DEFAULT → Backtracking. Smallest code, no allocation per level.
// - BFS → use when you specifically need all partials at each depth
//   (visualization, breadth-limited search).
// - Generate-and-filter (try all 2²ⁿ strings, filter) is 4× slower and
//   wastes work — interviewers will catch it.`,Subsets:`// ===== SOLUTION: Subsets =====
//
// ┌──────────────────────────────┬──────────┬─────────┬──────────┐
// │ Approach                     │ Time     │ Space   │ Verdict  │
// ├──────────────────────────────┼──────────┼─────────┼──────────┤
// │ 1. Backtracking              │ O(n·2ⁿ)  │ O(n)    │ BEST     │
// │ 2. Iterative bitmask         │ O(n·2ⁿ)  │ O(1) ⁺  │ Slick    │
// │ 3. Cascade (build iteratively│ O(n·2ⁿ)  │ O(n·2ⁿ) │ Readable │
// │     by doubling each step)   │          │         │          │
// └──────────────────────────────┴──────────┴─────────┴──────────┘
// ⁺ besides the output

// ----- Approach 1: Backtracking (BEST) -----
function subsets(nums) {
  const out = [];
  function back(i, path) {
    out.push([...path]);
    for (let j = i; j < nums.length; j++) {
      path.push(nums[j]);
      back(j + 1, path);
      path.pop();
    }
  }
  back(0, []);
  return out;
}

// ----- Approach 2: Iterative bitmask -----
// Each subset corresponds to an n-bit number 0..2ⁿ-1. Bit i set → include nums[i].
function subsetsBitmask(nums) {
  const out = [];
  const total = 1 << nums.length;
  for (let mask = 0; mask < total; mask++) {
    const subset = [];
    for (let i = 0; i < nums.length; i++) {
      if (mask & (1 << i)) subset.push(nums[i]);
    }
    out.push(subset);
  }
  return out;
}

// ----- Approach 3: Cascade -----
// Start with [[]]. For each num, double the result by appending num
// to a copy of every existing subset.
function subsetsCascade(nums) {
  let out = [[]];
  for (const x of nums) {
    out = out.concat(out.map(s => [...s, x]));
  }
  return out;
}

// ===== TEST CASES =====
const norm = arrs => [...arrs].map(a => JSON.stringify(a)).sort();
const test = (name, actual, expected) => {
  console.log(JSON.stringify(norm(actual)) === JSON.stringify(norm(expected)) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Backtracking) — BEST ---");
test("[1,2,3]", subsets([1,2,3]), [[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]);
test("[0]",     subsets([0]),     [[], [0]]);
test("[]",      subsets([]),      [[]]);
console.log("--- Approach 2 (Bitmask) ---");
test("[1,2,3] (bitmask)", subsetsBitmask([1,2,3]), [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]);
console.log("--- Approach 3 (Cascade) ---");
test("[1,2,3] (cascade)", subsetsCascade([1,2,3]), [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]);

// ===== When to pick which =====
// - DEFAULT → Backtracking. Cleanest, easy to add prune conditions.
// - Bitmask → fastest for small n (≤ 20). Beautiful one-liner; breaks at n=31+.
// - Cascade → easiest to explain, most allocations. Pick for whiteboard clarity.`,Permutations:`// ===== SOLUTION: Permutations =====
//
// ┌───────────────────────────────┬───────────┬──────┬──────────┐
// │ Approach                      │ Time      │ Space│ Verdict  │
// ├───────────────────────────────┼───────────┼──────┼──────────┤
// │ 1. Backtrack + used[]         │ O(n·n!)   │ O(n) │ BEST     │
// │ 2. Swap-in-place backtrack    │ O(n·n!)   │ O(n) │ No alloc │
// │ 3. Iterative insertion        │ O(n·n!)   │ O(n!)│ Educational│
// └───────────────────────────────┴───────────┴──────┴──────────┘

// ----- Approach 1: Backtracking with used[] (BEST) -----
function permute(nums) {
  const out = [], used = new Array(nums.length).fill(false);
  function back(path) {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      back(path);
      used[i] = false; path.pop();
    }
  }
  back([]);
  return out;
}

// ----- Approach 2: Swap-in-place backtrack -----
// Maintain a single array. Swap current position with each candidate,
// recurse, swap back. Avoids the used[] array.
function permuteSwap(nums) {
  const out = [];
  function back(start) {
    if (start === nums.length) { out.push([...nums]); return; }
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];
      back(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }
  back(0);
  return out;
}

// ----- Approach 3: Iterative — insert each num into every position of existing perms -----
function permuteIter(nums) {
  let out = [[]];
  for (const x of nums) {
    const next = [];
    for (const perm of out) {
      for (let i = 0; i <= perm.length; i++) {
        next.push([...perm.slice(0, i), x, ...perm.slice(i)]);
      }
    }
    out = next;
  }
  return out;
}

// ===== TEST CASES =====
const norm = arrs => [...arrs].map(a => JSON.stringify(a)).sort();
const test = (name, actual, expected) => {
  console.log(JSON.stringify(norm(actual)) === JSON.stringify(norm(expected)) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Backtrack + used) — BEST ---");
test("[1,2,3]", permute([1,2,3]), [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]);
test("[0,1]",   permute([0,1]),   [[0,1],[1,0]]);
test("[1]",     permute([1]),     [[1]]);
console.log("--- Approach 2 (Swap-in-place) ---");
test("[1,2,3] (swap)", permuteSwap([1,2,3]), [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]);
console.log("--- Approach 3 (Iterative insertion) ---");
test("[1,2,3] (iter)", permuteIter([1,2,3]), [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]);

// ===== When to pick which =====
// - DEFAULT → used[]-array backtrack. Clearest logic, easy to extend
//   to Permutations II (with duplicates → sort + skip when nums[i] === nums[i-1] && !used[i-1]).
// - Swap-in-place → less memory (no used[]), but mutates input.
// - Iterative → no recursion, but allocates n! intermediate arrays.`,"Min Stack":`// ===== SOLUTION: Min Stack =====
//
// ┌──────────────────────────────┬──────────┬────────┬──────────┐
// │ Approach                     │ Time     │ Space  │ Verdict  │
// ├──────────────────────────────┼──────────┼────────┼──────────┤
// │ 1. Parallel min stack        │ O(1) all │ O(n)   │ BEST     │
// │ 2. Single stack of pairs     │ O(1) all │ O(n)   │ Same idea│
// │ 3. Diff-encoded (no min stk) │ O(1) all │ O(n)*  │ Cute     │
// └──────────────────────────────┴──────────┴────────┴──────────┘
// * O(1) auxiliary aside from the main stack

// ----- Approach 1: Parallel min stack (BEST) -----
// On push, also push min(currentMin, newVal) to the min stack.
// Pop both together. getMin = peek the min stack.
class MinStack {
  constructor() { this.stack = []; this.mins = []; }
  push(x) {
    this.stack.push(x);
    this.mins.push(this.mins.length ? Math.min(this.mins[this.mins.length-1], x) : x);
  }
  pop() { this.stack.pop(); this.mins.pop(); }
  top() { return this.stack[this.stack.length - 1]; }
  getMin() { return this.mins[this.mins.length - 1]; }
}

// ----- Approach 2: Single stack of (value, currentMin) pairs -----
// Less memory contention; each entry self-contains its running min.
class MinStackPair {
  constructor() { this.stack = []; }
  push(x) {
    const min = this.stack.length ? Math.min(this.stack[this.stack.length-1].min, x) : x;
    this.stack.push({ val: x, min });
  }
  pop() { this.stack.pop(); }
  top() { return this.stack[this.stack.length - 1].val; }
  getMin() { return this.stack[this.stack.length - 1].min; }
}

// ----- Approach 3: Diff-encoded — single stack, no min stack -----
// Push x - currentMin instead of x. Negative → x < currentMin → update.
// Clever but harder to follow; useful where every bit of memory matters.
class MinStackDiff {
  constructor() { this.stack = []; this.min = null; }
  push(x) {
    if (this.stack.length === 0) { this.stack.push(0); this.min = x; }
    else {
      this.stack.push(x - this.min);
      if (x < this.min) this.min = x;
    }
  }
  pop() {
    const top = this.stack.pop();
    if (top < 0) this.min = this.min - top;
  }
  top() {
    const top = this.stack[this.stack.length - 1];
    return top < 0 ? this.min : this.min + top;
  }
  getMin() { return this.min; }
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${expected}, got \${actual}\`);
};
function runScenario(label, S) {
  const s = new S();
  s.push(-2); s.push(0); s.push(-3);
  test(label + " getMin after pushes", s.getMin(), -3);
  s.pop();
  test(label + " top after pop",       s.top(),     0);
  test(label + " getMin after pop",    s.getMin(), -2);
  s.push(-5); s.push(-5);
  test(label + " getMin two equal",    s.getMin(), -5);
  s.pop();
  test(label + " getMin one popped",   s.getMin(), -5);
}
runScenario("Approach 1 (parallel)", MinStack);
runScenario("Approach 2 (pair)",      MinStackPair);
runScenario("Approach 3 (diff)",      MinStackDiff);

// ===== When to pick which =====
// - DEFAULT → Parallel min stack. Clear and easy to extend (Max Stack
//   by swapping Math.min for Math.max, etc.).
// - Pair version → if you dislike maintaining two stacks in sync.
// - Diff-encoded → memorize for low-memory scenarios. Overflow risk
//   on 32-bit ints when diff exceeds INT_MAX. JS bigints sidestep this.`,"Daily Temperatures":`// ===== SOLUTION: Daily Temperatures =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Monotonic decreasing stack    │ O(n)  │ O(n)  │ BEST      │
// │ 2. Right-to-left jump skipping   │ O(n)  │ O(1)* │ Trickier  │
// │ 3. Brute force per index         │ O(n²) │ O(1)  │ Don't ship│
// └──────────────────────────────────┴───────┴───────┴───────────┘
// * besides output

// ----- Approach 1: Monotonic stack (BEST) -----
// Stack holds INDICES of unresolved days, temps decreasing top-to-bottom.
// On a warmer day, pop all colder ones and record their wait.
function dailyTemperatures(t) {
  const out = new Array(t.length).fill(0), stack = [];
  for (let i = 0; i < t.length; i++) {
    while (stack.length && t[i] > t[stack[stack.length - 1]]) {
      const j = stack.pop();
      out[j] = i - j;
    }
    stack.push(i);
  }
  return out;
}

// ----- Approach 2: Right-to-left with jump skipping -----
// Walk backward. For each i, if t[i+1] > t[i], answer is 1. Else use
// answer[i+1] to JUMP past resolved chunks. O(n) amortized, no stack.
function dailyTemperaturesJump(t) {
  const out = new Array(t.length).fill(0);
  for (let i = t.length - 2; i >= 0; i--) {
    let j = i + 1;
    while (j < t.length && t[j] <= t[i]) {
      if (out[j] === 0) { j = t.length; break; }   // no warmer day ahead
      j += out[j];
    }
    if (j < t.length) out[i] = j - i;
  }
  return out;
}

// ----- Approach 3: Brute force (BASELINE) -----
function dailyTemperaturesBrute(t) {
  const out = new Array(t.length).fill(0);
  for (let i = 0; i < t.length; i++) {
    for (let j = i + 1; j < t.length; j++) {
      if (t[j] > t[i]) { out[i] = j - i; break; }
    }
  }
  return out;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Monotonic stack) — BEST ---");
test("Mixed",      dailyTemperatures([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);
test("Increasing", dailyTemperatures([30,40,50,60]),             [1,1,1,0]);
test("Decreasing", dailyTemperatures([90,80,70]),                [0,0,0]);
console.log("--- Approach 2 (Jump skipping) ---");
test("Mixed (jump)", dailyTemperaturesJump([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);
console.log("--- Approach 3 (Brute force) ---");
test("Mixed (brute)", dailyTemperaturesBrute([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);

// ===== When to pick which =====
// - DEFAULT → Monotonic stack. The canonical pattern for "next greater element"
//   problems; reusable across many variants.
// - Jump skipping → O(1) extra space but harder to write correctly.
// - Brute force → only as a correctness sanity check on small inputs.`,"Coin Change":`// ===== SOLUTION: Coin Change =====
//
// ┌──────────────────────────────────┬──────────────┬───────┬───────────┐
// │ Approach                         │ Time         │ Space │ Verdict   │
// ├──────────────────────────────────┼──────────────┼───────┼───────────┤
// │ 1. Bottom-up DP                  │ O(amount·k)  │ O(amount)│ BEST    │
// │ 2. Memoized recursion (top-down) │ O(amount·k)  │ O(amount)│ Equiv   │
// │ 3. BFS (shortest path in coins)  │ O(amount·k)  │ O(amount)│ Cute    │
// │ 4. Greedy (NOT general)          │ FAILS for [1,3,4]│   │ Wrong   │
// └──────────────────────────────────┴──────────────┴───────┴───────────┘

// ----- Approach 1: Bottom-up DP (BEST) -----
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}

// ----- Approach 2: Memoized recursion (top-down) -----
function coinChangeMemo(coins, amount) {
  const memo = new Map();
  function dp(a) {
    if (a === 0) return 0;
    if (a < 0) return Infinity;
    if (memo.has(a)) return memo.get(a);
    let best = Infinity;
    for (const c of coins) best = Math.min(best, dp(a - c) + 1);
    memo.set(a, best);
    return best;
  }
  const result = dp(amount);
  return result === Infinity ? -1 : result;
}

// ----- Approach 3: BFS — treat amounts as graph nodes -----
function coinChangeBFS(coins, amount) {
  if (amount === 0) return 0;
  const visited = new Set([0]);
  let frontier = [0], depth = 0;
  while (frontier.length) {
    depth++;
    const next = [];
    for (const a of frontier) {
      for (const c of coins) {
        const na = a + c;
        if (na === amount) return depth;
        if (na < amount && !visited.has(na)) { visited.add(na); next.push(na); }
      }
    }
    frontier = next;
  }
  return -1;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${expected}, got \${actual}\`);
};
console.log("--- Approach 1 (Bottom-up DP) — BEST ---");
test("Standard",   coinChange([1,2,5], 11),  3);
test("Impossible", coinChange([2], 3),      -1);
test("Zero",       coinChange([1], 0),       0);
test("Single",     coinChange([1,2,5], 5),   1);
console.log("--- Approach 2 (Memoized) ---");
test("Standard (memo)", coinChangeMemo([1,2,5], 11), 3);
console.log("--- Approach 3 (BFS) ---");
test("Standard (BFS)",  coinChangeBFS([1,2,5], 11),  3);

// ===== When to pick which =====
// - DEFAULT → Bottom-up DP. Predictable memory layout, easy to extend
//   to "list the coins used" by tracking parents.
// - Memoized recursion → same complexity, slightly more readable.
// - BFS → conceptually nice (shortest path in coin graph) but most code.
// - Greedy FAILS: coins=[1,3,4], amount=6. Greedy picks 4+1+1=3 coins.
//   Optimal is 3+3=2 coins. Greedy works for "canonical" sets (US coins)
//   but NOT in general — never use greedy here.`,"House Robber":`// ===== SOLUTION: House Robber =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. O(1)-space DP (2 scalars)     │ O(n)  │ O(1)  │ BEST      │
// │ 2. DP array (explicit dp[])      │ O(n)  │ O(n)  │ Educational│
// │ 3. Memoized recursion (top-down) │ O(n)  │ O(n)  │ Equivalent│
// │ 4. Naive recursion               │ O(2ⁿ) │ O(n)  │ Don't ship│
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: O(1) space DP (BEST) -----
// dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Only the last two matter.
function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) {
    const curr = Math.max(prev1, prev2 + x);
    prev2 = prev1; prev1 = curr;
  }
  return prev1;
}

// ----- Approach 2: Explicit dp[] array -----
// Same recurrence, easier to debug. Useful first draft before optimizing space.
function robDP(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  const dp = new Array(nums.length);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);
  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }
  return dp[nums.length - 1];
}

// ----- Approach 3: Memoized recursion -----
function robMemo(nums) {
  const memo = new Map();
  function helper(i) {
    if (i < 0) return 0;
    if (memo.has(i)) return memo.get(i);
    const result = Math.max(helper(i - 1), helper(i - 2) + nums[i]);
    memo.set(i, result);
    return result;
  }
  return helper(nums.length - 1);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${expected}, got \${actual}\`);
};
console.log("--- Approach 1 (O(1) DP) — BEST ---");
test("Standard", rob([1,2,3,1]),     4);
test("Larger",   rob([2,7,9,3,1]),  12);
test("Single",   rob([5]),           5);
test("Empty",    rob([]),            0);
console.log("--- Approach 2 (dp array) ---");
test("Larger (DP)",   robDP([2,7,9,3,1]),  12);
console.log("--- Approach 3 (Memoized) ---");
test("Larger (memo)", robMemo([2,7,9,3,1]), 12);

// ===== When to pick which =====
// - DEFAULT → O(1) DP. Two scalars, single loop, no allocation.
// - dp[] array → when you also need to reconstruct WHICH houses to rob
//   (backtrack from dp[n-1] checking which branch was chosen).
// - Memoized recursion → same complexity, eats stack. Good as a teaching
//   bridge from "naive recursion" to bottom-up DP.
// - Naive recursion (no memo) → exponential. Demonstrates the overlapping
//   subproblem problem that DP solves.`,"Jump Game":`// ===== SOLUTION: Jump Game =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Greedy (farthest reachable)   │ O(n)  │ O(1)  │ BEST      │
// │ 2. DP (reverse, fill reachable)  │ O(n²) │ O(n)  │ Slower    │
// │ 3. Backtracking (try all jumps)  │ O(2ⁿ) │ O(n)  │ Don't ship│
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Greedy (BEST) -----
// Track farthest reachable. If i > farthest → can't even reach here → false.
function canJump(nums) {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + nums[i]);
  }
  return true;
}

// ----- Approach 2: Reverse DP -----
// Walk right to left. Track the leftmost index from which the end is reachable.
function canJumpDP(nums) {
  let lastGood = nums.length - 1;
  for (let i = nums.length - 2; i >= 0; i--) {
    if (i + nums[i] >= lastGood) lastGood = i;
  }
  return lastGood === 0;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Greedy) — BEST ---");
test("Reachable",  canJump([2,3,1,1,4]), true);
test("Stuck",      canJump([3,2,1,0,4]), false);
test("Single",     canJump([0]),         true);
test("Zero start", canJump([0,1]),       false);
console.log("--- Approach 2 (Reverse DP) ---");
test("Reachable (DP)", canJumpDP([2,3,1,1,4]), true);
test("Stuck (DP)",     canJumpDP([3,2,1,0,4]), false);

// ===== When to pick which =====
// - DEFAULT → Greedy. Single forward pass, O(1) space. Proof: at each i,
//   if any earlier position could reach i, then "farthest from any j<=i"
//   ≥ i. Dropping any earlier position's contribution is never useful.
// - Reverse DP → easier to convert to "Jump Game II" (min jumps), since
//   you can also track the count of jumps.
// - Backtracking → exponential without memoization, polynomial with it
//   (essentially the same as DP). Skip.`,"Detect Cycle in Linked List":`// ===== SOLUTION: Detect Cycle in Linked List =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Floyd's tortoise & hare       │ O(n)  │ O(1)  │ BEST      │
// │ 2. Hash set of visited nodes     │ O(n)  │ O(n)  │ More intuitive│
// │ 3. Marking nodes (mutate)        │ O(n)  │ O(1)  │ Avoid in prod│
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Floyd's tortoise & hare (BEST) -----
// Slow advances 1, fast advances 2. With a cycle, fast laps slow.
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// ----- Approach 2: Hash set of visited nodes -----
// Walk forward, add each node to a Set. If we revisit, cycle detected.
function hasCycleSet(head) {
  const seen = new Set();
  let cur = head;
  while (cur) {
    if (seen.has(cur)) return true;
    seen.add(cur);
    cur = cur.next;
  }
  return false;
}

// ===== TEST CASES =====
class ListNode { constructor(val) { this.val = val; this.next = null; } }
const fromArray = (arr, cycleAtIdx = -1) => {
  if (!arr.length) return null;
  const nodes = arr.map(v => new ListNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  if (cycleAtIdx >= 0) nodes[nodes.length - 1].next = nodes[cycleAtIdx];
  return nodes[0];
};
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Floyd's) — BEST ---");
test("With cycle", hasCycle(fromArray([3,2,0,-4], 1)), true);
test("No cycle",   hasCycle(fromArray([1,2,3,4])),     false);
test("Self loop",  hasCycle(fromArray([1], 0)),         true);
test("Empty",      hasCycle(null),                      false);
console.log("--- Approach 2 (Hash set) ---");
test("With cycle (set)", hasCycleSet(fromArray([3,2,0,-4], 1)), true);
test("No cycle (set)",   hasCycleSet(fromArray([1,2,3,4])),     false);

// ===== When to pick which =====
// - DEFAULT → Floyd's. O(1) space — the key advantage. Same algorithm
//   extends to "find cycle start" (move one pointer back to head, both at 1×).
// - Hash set → simpler to explain, but O(n) extra space.
// - Marking nodes (set node.val to a sentinel) → mutates the list, breaks
//   read-only contracts. Don't do this in production.`,"Sort Colors":`// ===== SOLUTION: Sort Colors (Dutch Flag) =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Three-pointer (Dutch Flag)    │ O(n)  │ O(1)  │ BEST      │
// │ 2. Counting sort (2 passes)      │ O(n)  │ O(1)  │ Easy read │
// │ 3. Sort built-in                 │ O(n log n)│ O(1)│ Lazy    │
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Three-pointer Dutch Flag (BEST) -----
// low = next 0-slot, mid = cursor, high = next 2-slot.
// Single pass, no auxiliary space, no extra passes.
function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) { [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++; }
    else if (nums[mid] === 2) { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; }
    else mid++;
  }
}

// ----- Approach 2: Counting sort -----
// First pass: count 0s, 1s, 2s. Second pass: overwrite array in order.
function sortColorsCount(nums) {
  let z = 0, o = 0, t = 0;
  for (const x of nums) { if (x === 0) z++; else if (x === 1) o++; else t++; }
  let i = 0;
  for (let k = 0; k < z; k++) nums[i++] = 0;
  for (let k = 0; k < o; k++) nums[i++] = 1;
  for (let k = 0; k < t; k++) nums[i++] = 2;
}

// ----- Approach 3: Sort built-in -----
function sortColorsSort(nums) { nums.sort((a, b) => a - b); }

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Dutch Flag) — BEST ---");
const a1 = [2,0,2,1,1,0]; sortColors(a1); test("Mixed", a1, [0,0,1,1,2,2]);
const a2 = [2,0,1];        sortColors(a2); test("Tiny",  a2, [0,1,2]);
const a3 = [0];            sortColors(a3); test("Single",a3, [0]);
const a4 = [1,1,1];        sortColors(a4); test("Same",  a4, [1,1,1]);
console.log("--- Approach 2 (Counting sort) ---");
const b1 = [2,0,2,1,1,0]; sortColorsCount(b1); test("Mixed (count)", b1, [0,0,1,1,2,2]);
console.log("--- Approach 3 (Sort built-in) ---");
const c1 = [2,0,2,1,1,0]; sortColorsSort(c1); test("Mixed (sort)",  c1, [0,0,1,1,2,2]);

// ===== When to pick which =====
// - DEFAULT → Dutch Flag. One pass, in-place, optimal. The canonical
//   "partition into 3 buckets" technique — also used in 3-way quicksort.
// - Counting sort → easier to understand, two passes. Use if interviewer
//   says "two passes ok".
// - Built-in sort → trivially correct, O(n log n). Only fine if "any
//   sort works" wasn't disallowed.`,"Top K Frequent Elements":`// ===== SOLUTION: Top K Frequent Elements =====
//
// ┌──────────────────────────────────┬─────────────┬───────┬───────────┐
// │ Approach                         │ Time        │ Space │ Verdict   │
// ├──────────────────────────────────┼─────────────┼───────┼───────────┤
// │ 1. Bucket sort by frequency      │ O(n)        │ O(n)  │ BEST      │
// │ 2. Min-heap of size k            │ O(n log k)  │ O(k)  │ Streaming │
// │ 3. Sort entries by freq          │ O(n log n)  │ O(n)  │ Simplest  │
// └──────────────────────────────────┴─────────────┴───────┴───────────┘

// ----- Approach 1: Bucket sort (BEST — O(n)) -----
// Frequencies are bounded 1..n. Create n+1 buckets; bucket[f] = list of
// values with frequency f. Walk buckets high → low, collect k items.
function topK(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [val, freq] of count) buckets[freq].push(val);
  const out = [];
  for (let f = buckets.length - 1; f >= 1 && out.length < k; f--) {
    for (const v of buckets[f]) {
      out.push(v);
      if (out.length === k) return out;
    }
  }
  return out;
}

// ----- Approach 2: Min-heap of size k (good for streaming) -----
// Simplified: sort the entries and take the top k. (Real heap not in JS std.)
function topKHeap(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  // Min-heap of size k — we kick out the smallest-freq item when over capacity.
  // JS has no native heap, so this is a conceptual variant; in practice the
  // bucket approach beats it for in-memory work. For STREAMING you'd use a
  // real heap that processes items one at a time.
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([v]) => v);
}

// ----- Approach 3: Sort entries by frequency -----
// Simplest expression; O(n log n) due to the sort.
function topKSort(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([v]) => v);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort()) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Bucket sort) — BEST ---");
test("k=2",         topK([1,1,1,2,2,3], 2), [1, 2]);
test("k=1",         topK([1], 1),           [1]);
test("All distinct",topK([4,5,6], 2),       [4, 5]);
test("All same",    topK([7,7,7], 1),       [7]);
console.log("--- Approach 2 (Heap-equivalent) ---");
test("k=2 (heap)", topKHeap([1,1,1,2,2,3], 2), [1, 2]);
console.log("--- Approach 3 (Sort) ---");
test("k=2 (sort)", topKSort([1,1,1,2,2,3], 2), [1, 2]);

// ===== When to pick which =====
// - DEFAULT → Bucket sort. Strictly O(n), beats every alternative.
// - Min-heap → use when the input is a STREAM (can't bucket because
//   you don't know n in advance). True heap impl is O(n log k).
// - Sort → easiest to read; pick when n is moderate or you want to
//   show breadth before optimizing.`,"Merge Two Sorted Lists":`// ===== SOLUTION: Merge Two Sorted Lists =====
//
// ┌──────────────────────────────────┬──────────┬──────────┬───────────┐
// │ Approach                         │ Time     │ Space    │ Verdict   │
// ├──────────────────────────────────┼──────────┼──────────┼───────────┤
// │ 1. Dummy head + tail (iterative) │ O(m+n)   │ O(1)     │ BEST      │
// │ 2. Recursive                     │ O(m+n)   │ O(m+n)   │ Elegant   │
// │ 3. Build array + sort            │ O(N log N)│ O(N)    │ Wasteful  │
// └──────────────────────────────────┴──────────┴──────────┴───────────┘

class ListNode { constructor(val) { this.val = val; this.next = null; } }

// ----- Approach 1: Dummy head iterative (BEST) -----
// Dummy node avoids special-casing "the very first node". Walk both,
// always attaching the smaller. When one runs out, splice the other.
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
    else { tail.next = l2; l2 = l2.next; }
    tail = tail.next;
  }
  tail.next = l1 || l2;
  return dummy.next;
}

// ----- Approach 2: Recursive -----
// merge(l1, l2) = pick the smaller head, recurse on the rest with the other.
function mergeRec(l1, l2) {
  if (!l1) return l2;
  if (!l2) return l1;
  if (l1.val <= l2.val) {
    l1.next = mergeRec(l1.next, l2);
    return l1;
  } else {
    l2.next = mergeRec(l1, l2.next);
    return l2;
  }
}

// ===== TEST CASES =====
const fromArray = arr => {
  if (!arr.length) return null;
  const head = new ListNode(arr[0]);
  let cur = head;
  for (let i = 1; i < arr.length; i++) { cur.next = new ListNode(arr[i]); cur = cur.next; }
  return head;
};
const toArray = head => {
  const out = []; let cur = head;
  while (cur) { out.push(cur.val); cur = cur.next; }
  return out;
};
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Iterative) — BEST ---");
test("Standard",  toArray(mergeTwoLists(fromArray([1,2,4]), fromArray([1,3,4]))), [1,1,2,3,4,4]);
test("L1 empty",  toArray(mergeTwoLists(null, fromArray([0]))),                    [0]);
test("Both empty",toArray(mergeTwoLists(null, null)),                              []);
test("Disjoint",  toArray(mergeTwoLists(fromArray([1,2,3]), fromArray([4,5,6]))), [1,2,3,4,5,6]);
console.log("--- Approach 2 (Recursive) ---");
test("Standard (rec)", toArray(mergeRec(fromArray([1,2,4]), fromArray([1,3,4]))), [1,1,2,3,4,4]);

// ===== When to pick which =====
// - DEFAULT → Iterative with dummy head. O(1) extra space, no recursion
//   risk on huge lists.
// - Recursive → 4 lines, very elegant, but uses O(m+n) stack — overflow
//   on lists with millions of nodes.
// - Array + sort → throws away the "already sorted" property, O(N log N).
//   Don't.`,"Rotate Array Left":`// ===== SOLUTION: Rotate Array Left =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Three-reversal trick (in place)│ O(n) │ O(1)  │ BEST      │
// │ 2. Slice + concat                │ O(n)  │ O(n)  │ Readable  │
// │ 3. Reuse rotateRight(n-k)        │ O(n)  │ O(1)  │ One-liner │
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Three-reversal (BEST) -----
// Same three reversals as right-rotation, in OPPOSITE order:
//   reverse first-k → reverse rest → reverse whole.
// (Right does: whole → first-k → rest.)
function rotateLeft(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  k = k % n;
  const reverse = (l, r) => {
    while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; }
  };
  reverse(0, k - 1);
  reverse(k, n - 1);
  reverse(0, n - 1);
  return nums;
}

// ----- Approach 2: Slice + concat -----
// "Take the first k, stick them at the end." Simplest mental model.
function rotateLeftSlice(nums, k) {
  const n = nums.length;
  if (n === 0) return [];
  k = k % n;
  return nums.slice(k).concat(nums.slice(0, k));
}

// ----- Approach 3: rotateLeft(k) === rotateRight(n − k) -----
// Direct identity. If you have a working right-rotation, one line.
function rotateRight(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  k = k % n;
  const reverse = (l, r) => { while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; } };
  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
  return nums;
}
function rotateLeftViaRight(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  return rotateRight(nums, n - (k % n));
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Three-reversal) — BEST ---");
test("Standard", rotateLeft([1,2,3,4,5,6,7], 3), [4,5,6,7,1,2,3]);
test("k > n",    rotateLeft([1,2,3], 5),         [3,1,2]);
test("k = n",    rotateLeft([1,2,3,4], 4),       [1,2,3,4]);
test("k = 0",    rotateLeft([1,2,3], 0),         [1,2,3]);
test("Empty",    rotateLeft([], 3),              []);
test("Single",   rotateLeft([42], 1),            [42]);
console.log("--- Approach 2 (Slice + concat) ---");
test("Standard (slice)", rotateLeftSlice([1,2,3,4,5,6,7], 3), [4,5,6,7,1,2,3]);
console.log("--- Approach 3 (Via right-rotation) ---");
test("Standard (via right)", rotateLeftViaRight([1,2,3,4,5,6,7], 3), [4,5,6,7,1,2,3]);

// ===== When to pick which =====
// - DEFAULT → Three-reversal. O(1) space, the canonical in-place answer.
//   See "Rotate Array" (right) — same three reversals, opposite order.
// - Slice + concat → most readable; O(n) extra space. Fine in real code.
// - Via right-rotation → use this if you already have rotateRight
//   working and want to avoid duplicating the logic.`,"Reverse Words in a String":`// ===== SOLUTION: Reverse Words in a String =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Split / filter / reverse / join│ O(n) │ O(n)  │ BEST      │
// │ 2. Trim + split + reverse + join │ O(n)  │ O(n)  │ Same idea │
// │ 3. Reverse-twice in place (chars)│ O(n)  │ O(n)*│ Char-array│
// └──────────────────────────────────┴───────┴───────┴───────────┘
// * O(1) if input is a mutable char array (other languages)

// ----- Approach 1: One-liner (BEST in JS) -----
// Strings are immutable in JS; the pure built-in chain is hard to beat.
function reverseWords(s) {
  return s.split(/\\s+/).filter(Boolean).reverse().join(" ");
}

// ----- Approach 2: Trim then split on single spaces -----
// Equivalent but uses trim() to handle leading/trailing whitespace,
// then split on \\s+ for multiple internal spaces.
function reverseWordsTrim(s) {
  return s.trim().split(/\\s+/).reverse().join(" ");
}

// ----- Approach 3: Reverse-twice trick (educational) -----
// Reverse the WHOLE string, then reverse each word in place.
// Pairs with the Reverse String challenge. In C/Java this is the
// canonical in-place answer; in JS we still allocate since strings are immutable.
function reverseWordsTwiceTrick(s) {
  const arr = s.trim().split("").reverse(); // reverse all chars
  let i = 0, out = [];
  while (i < arr.length) {
    while (i < arr.length && arr[i] === " ") i++;
    const wordStart = i;
    while (i < arr.length && arr[i] !== " ") i++;
    const word = arr.slice(wordStart, i).reverse().join("");
    if (word) out.push(word);
  }
  return out.join(" ");
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};
console.log("--- Approach 1 (One-liner) — BEST ---");
test("Standard",        reverseWords("the sky is blue"),   "blue is sky the");
test("Trim + collapse", reverseWords("  hello   world  "), "world hello");
test("Single word",     reverseWords("hello"),             "hello");
test("Empty",           reverseWords(""),                  "");
test("All spaces",      reverseWords("    "),              "");
test("Punctuated",      reverseWords("a good   example"),  "example good a");
console.log("--- Approach 2 (Trim + split) ---");
test("Standard (trim)",   reverseWordsTrim("the sky is blue"), "blue is sky the");
console.log("--- Approach 3 (Reverse-twice) ---");
test("Standard (twice)",  reverseWordsTwiceTrick("the sky is blue"), "blue is sky the");

// ===== When to pick which =====
// - DEFAULT (JS) → One-liner. Strings are immutable so the in-place
//   trick offers no real win.
// - Trim + split → marginally less work than filter(Boolean); pick
//   whichever you find readable.
// - Reverse-twice trick → SHIP in C/C++/Java where char arrays are
//   mutable and O(1) extra space matters. In an interview, mention
//   it to show you know the in-place approach exists.`,"Longest Common Prefix":`// ===== SOLUTION: Longest Common Prefix =====
//
// ┌──────────────────────────────────┬──────────┬───────┬───────────┐
// │ Approach                         │ Time     │ Space │ Verdict   │
// ├──────────────────────────────────┼──────────┼───────┼───────────┤
// │ 1. Vertical scan (column-wise)   │ O(S)     │ O(1)  │ BEST      │
// │ 2. Horizontal scan (reduce)      │ O(S)     │ O(L)  │ Functional│
// │ 3. Sort + compare first vs last  │ O(N log N + L)│ O(1)│ Cute   │
// │ 4. Divide & conquer              │ O(S)     │ O(log N)│ Showy   │
// └──────────────────────────────────┴──────────┴───────┴───────────┘
// S = total chars across all strings; L = length of LCP; N = #strings.

// ----- Approach 1: Vertical scan (BEST) -----
// Walk character index i forward; at each i check that strs[0][i] matches
// every strs[j][i]. Stop on first mismatch or when any string ends.
function longestCommonPrefix(strs) {
  if (strs.length === 0) return "";
  for (let i = 0; i < strs[0].length; i++) {
    const c = strs[0][i];
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== c) return strs[0].slice(0, i);
    }
  }
  return strs[0];
}

// ----- Approach 2: Horizontal scan via reduce -----
// Reduce by taking pairwise common prefix. Functional flavor.
function longestCommonPrefixReduce(strs) {
  if (strs.length === 0) return "";
  return strs.reduce((prefix, s) => {
    while (s.indexOf(prefix) !== 0) prefix = prefix.slice(0, -1);
    return prefix;
  });
}

// ----- Approach 3: Sort + first vs last -----
// Sorting puts the most "different" strings at the extremes. Common prefix
// of the first and last is the LCP of the whole set.
function longestCommonPrefixSort(strs) {
  if (strs.length === 0) return "";
  const sorted = [...strs].sort();
  const a = sorted[0], b = sorted[sorted.length - 1];
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return a.slice(0, i);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Vertical scan) — BEST ---");
test("Standard",  longestCommonPrefix(["flower","flow","flight"]), "fl");
test("No common", longestCommonPrefix(["dog","racecar","car"]),    "");
test("Single",    longestCommonPrefix(["alone"]),                  "alone");
test("Identical", longestCommonPrefix(["abc","abc","abc"]),        "abc");
test("Empty",     longestCommonPrefix([]),                          "");
test("One empty", longestCommonPrefix(["", "abc"]),                 "");
console.log("--- Approach 2 (Horizontal reduce) ---");
test("Standard (reduce)", longestCommonPrefixReduce(["flower","flow","flight"]), "fl");
console.log("--- Approach 3 (Sort + first/last) ---");
test("Standard (sort)", longestCommonPrefixSort(["flower","flow","flight"]), "fl");

// ===== When to pick which =====
// - DEFAULT → Vertical scan. Early-exit on first mismatch — beats every
//   other approach on adversarial input ("ab...z" vs "ac...").
// - Horizontal reduce → most idiomatic JS, slightly more work than needed.
// - Sort trick → relies on alphabetical order; clever but not faster.
// - Divide & conquer → equivalent complexity, more code.`,"Longest Palindromic Substring":`// ===== SOLUTION: Longest Palindromic Substring =====
//
// ┌──────────────────────────────────┬──────────┬───────┬───────────┐
// │ Approach                         │ Time     │ Space │ Verdict   │
// ├──────────────────────────────────┼──────────┼───────┼───────────┤
// │ 1. Expand around center          │ O(n²)    │ O(1)  │ BEST      │
// │ 2. DP table                      │ O(n²)    │ O(n²) │ Reference │
// │ 3. Manacher's algorithm          │ O(n)     │ O(n)  │ Showy     │
// │ 4. Brute force (every substring) │ O(n³)    │ O(1)  │ Don't ship│
// └──────────────────────────────────┴──────────┴───────┴───────────┘

// ----- Approach 1: Expand around center (BEST for interviews) -----
// 2n-1 possible centers: n single chars (odd-length) + n-1 between chars (even).
function longestPalindrome(s) {
  if (!s) return "";
  let start = 0, maxLen = 1;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    const len = r - l - 1;
    if (len > maxLen) { maxLen = len; start = l + 1; }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i);        // odd-length
    expand(i, i + 1);    // even-length
  }
  return s.slice(start, start + maxLen);
}

// ----- Approach 2: DP table -----
// dp[i][j] = is s[i..j] a palindrome? True iff s[i]===s[j] AND dp[i+1][j-1].
function longestPalindromeDP(s) {
  const n = s.length;
  if (n < 2) return s;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0, maxLen = 1;
  for (let i = 0; i < n; i++) dp[i][i] = true;
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len <= n; i++) {
      const j = i + len - 1;
      if (s[i] === s[j] && (len === 2 || dp[i + 1][j - 1])) {
        dp[i][j] = true;
        if (len > maxLen) { maxLen = len; start = i; }
      }
    }
  }
  return s.slice(start, start + maxLen);
}

// ===== TEST CASES =====
const isPalin = x => x === [...x].reverse().join("");
const test = (name, actual, possible) => {
  const pass = isPalin(actual) && possible.some(p => p.length === actual.length);
  console.log(pass ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Expand around center) — BEST ---");
test("babad",    longestPalindrome("babad"), ["bab","aba"]);
test("cbbd",     longestPalindrome("cbbd"),  ["bb"]);
test("All same", longestPalindrome("aaaa"),  ["aaaa"]);
test("Single",   longestPalindrome("a"),     ["a"]);
console.log("--- Approach 2 (DP table) ---");
test("babad (DP)", longestPalindromeDP("babad"), ["bab","aba"]);

// ===== When to pick which =====
// - DEFAULT → Expand around center. O(1) extra space, easy to code in
//   an interview, and the early exit on mismatch makes it fast in practice.
// - DP table → equivalent time but O(n²) space. Useful when you also need
//   to ANSWER "is s[i..j] a palindrome?" queries later.
// - Manacher → O(n), beautiful, but complex enough that nobody asks for it
//   live. Worth knowing exists.`,"Reverse Vowels of a String":`// ===== SOLUTION: Reverse Vowels of a String =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Two-pointer in-place          │ O(n)  │ O(n)* │ BEST      │
// │ 2. Extract → reverse → splice    │ O(n)  │ O(n)  │ Two passes│
// └──────────────────────────────────┴───────┴───────┴───────────┘
// * O(n) for the char array; O(1) extra beyond that

// ----- Approach 1: Two-pointer in-place (BEST) -----
// L scans forward to a vowel; R scans backward to a vowel; swap; step inward.
function reverseVowels(s) {
  const arr = s.split("");
  const vowels = new Set(["a","e","i","o","u","A","E","I","O","U"]);
  let l = 0, r = arr.length - 1;
  while (l < r) {
    while (l < r && !vowels.has(arr[l])) l++;
    while (l < r && !vowels.has(arr[r])) r--;
    [arr[l], arr[r]] = [arr[r], arr[l]];
    l++; r--;
  }
  return arr.join("");
}

// ----- Approach 2: Extract → reverse → splice -----
// Pull out the vowels into an array, reverse it, then walk the original
// and replace each vowel with the next from the reversed list.
function reverseVowelsExtract(s) {
  const vowels = new Set(["a","e","i","o","u","A","E","I","O","U"]);
  const chars = s.split("");
  const list = chars.filter(c => vowels.has(c)).reverse();
  let idx = 0;
  return chars.map(c => (vowels.has(c) ? list[idx++] : c)).join("");
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Two-pointer) — BEST ---");
test("hello",      reverseVowels("hello"),    "holle");
test("leetcode",   reverseVowels("leetcode"), "leotcede");
test("Mixed case", reverseVowels("aA"),       "Aa");
test("No vowels",  reverseVowels("bcdfg"),    "bcdfg");
test("All vowels", reverseVowels("aeiou"),    "uoiea");
test("Empty",      reverseVowels(""),         "");
console.log("--- Approach 2 (Extract → reverse → splice) ---");
test("hello (extract)",    reverseVowelsExtract("hello"),    "holle");
test("leetcode (extract)", reverseVowelsExtract("leetcode"), "leotcede");

// ===== When to pick which =====
// - DEFAULT → Two-pointer. Single pass, minimal allocation.
// - Extract → reverse → splice: pedagogical first draft. Use when explaining
//   the problem; then mention "we can do it in one pass with two pointers".`,"String to Integer (atoi)":`// ===== SOLUTION: String to Integer (atoi) =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Manual phase walk             │ O(n)  │ O(1)  │ BEST      │
// │ 2. Regex extract + parseInt      │ O(n)  │ O(1)  │ Brittle   │
// │ 3. State machine (formal DFA)    │ O(n)  │ O(1)  │ Verbose   │
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Manual phase walk (BEST) -----
// Four phases: skip whitespace, read sign, read digits, clamp to INT32.
function myAtoi(s) {
  const INT_MAX = 2 ** 31 - 1, INT_MIN = -(2 ** 31);
  let i = 0;
  while (i < s.length && s[i] === " ") i++;
  let sign = 1;
  if (s[i] === "+") i++;
  else if (s[i] === "-") { sign = -1; i++; }
  let result = 0;
  while (i < s.length && s[i] >= "0" && s[i] <= "9") {
    result = result * 10 + (s.charCodeAt(i) - 48);
    if (sign * result > INT_MAX) return INT_MAX;
    if (sign * result < INT_MIN) return INT_MIN;
    i++;
  }
  return sign * result;
}

// ----- Approach 2: Regex extract + parseInt -----
// Pattern: optional whitespace, optional sign, run of digits.
// Then clamp to INT32 manually since parseInt produces JS numbers.
function myAtoiRegex(s) {
  const INT_MAX = 2 ** 31 - 1, INT_MIN = -(2 ** 31);
  const match = s.match(/^\\s*([-+]?\\d+)/);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  if (n > INT_MAX) return INT_MAX;
  if (n < INT_MIN) return INT_MIN;
  return n;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${expected}, got \${actual}\`);
};
console.log("--- Approach 1 (Manual phase walk) — BEST ---");
test("Basic",         myAtoi("42"),             42);
test("With spaces",   myAtoi("   -42"),         -42);
test("Trailing",      myAtoi("4193 with words"),4193);
test("Leading words", myAtoi("words 987"),      0);
test("Overflow",      myAtoi("91283472332"),    2147483647);
test("Underflow",     myAtoi("-91283472332"),   -2147483648);
test("Plus",          myAtoi("+1"),             1);
test("Just sign",     myAtoi("-"),              0);
test("Empty",         myAtoi(""),               0);
console.log("--- Approach 2 (Regex + parseInt) ---");
test("Basic (regex)",   myAtoiRegex("42"),       42);
test("Spaces (regex)",  myAtoiRegex("   -42"),   -42);
test("Trailing (regex)",myAtoiRegex("4193 abc"), 4193);
test("Leading (regex)", myAtoiRegex("words 987"),0);

// ===== When to pick which =====
// - DEFAULT → Manual phase walk. Most interviewers want to see you
//   articulate each phase (whitespace / sign / digits / clamp).
// - Regex + parseInt → fewer lines, but interviewers usually rule out
//   parseInt because "the point is to implement atoi from scratch".
// - Formal DFA → 4 states × 4 input classes table. Showy and verbose
//   for what is essentially a 15-line problem.`,"Letter Combinations of Phone Number":`// ===== SOLUTION: Letter Combinations of Phone Number =====
//
// ┌──────────────────────────────────┬──────────┬──────────┬───────────┐
// │ Approach                         │ Time     │ Space    │ Verdict   │
// ├──────────────────────────────────┼──────────┼──────────┼───────────┤
// │ 1. Backtracking (recursive)      │ O(4ⁿ·n)  │ O(n)     │ BEST      │
// │ 2. Iterative BFS (cartesian)     │ O(4ⁿ·n)  │ O(4ⁿ·n)  │ No recurse│
// │ 3. Reduce-based                  │ O(4ⁿ·n)  │ O(4ⁿ·n)  │ FP-style  │
// └──────────────────────────────────┴──────────┴──────────┴───────────┘

const MAP = { "2":"abc","3":"def","4":"ghi","5":"jkl","6":"mno","7":"pqrs","8":"tuv","9":"wxyz" };

// ----- Approach 1: Backtracking (BEST) -----
function letterCombinations(digits) {
  if (!digits) return [];
  const out = [];
  function back(i, path) {
    if (i === digits.length) { out.push(path); return; }
    for (const c of MAP[digits[i]]) back(i + 1, path + c);
  }
  back(0, "");
  return out;
}

// ----- Approach 2: Iterative BFS -----
// Start with [""]. For each digit, replace each partial with its
// extended versions (one per letter mapped to the digit).
function letterCombinationsBFS(digits) {
  if (!digits) return [];
  let out = [""];
  for (const d of digits) {
    const next = [];
    for (const partial of out) {
      for (const c of MAP[d]) next.push(partial + c);
    }
    out = next;
  }
  return out;
}

// ----- Approach 3: Reduce-based (functional) -----
function letterCombinationsReduce(digits) {
  if (!digits) return [];
  return [...digits].reduce(
    (acc, d) => acc.flatMap(partial => [...MAP[d]].map(c => partial + c)),
    [""]
  );
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort()) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Backtracking) — BEST ---");
test("23",     letterCombinations("23"),  ["ad","ae","af","bd","be","bf","cd","ce","cf"]);
test("Single", letterCombinations("2"),    ["a","b","c"]);
test("Empty",  letterCombinations(""),     []);
console.log("--- Approach 2 (Iterative BFS) ---");
test("23 (BFS)", letterCombinationsBFS("23"), ["ad","ae","af","bd","be","bf","cd","ce","cf"]);
console.log("--- Approach 3 (Reduce) ---");
test("23 (reduce)", letterCombinationsReduce("23"), ["ad","ae","af","bd","be","bf","cd","ce","cf"]);

// ===== When to pick which =====
// - DEFAULT → Backtracking. Smallest code, easy to add pruning if you
//   later need to filter (e.g., "no consecutive same letters").
// - Iterative BFS → use when recursion-stack risk matters (digits up
//   to 10–15 — fine for recursion but no harm in iterating).
// - Reduce → most FP-idiomatic, allocates intermediate arrays.`,"Single Number":`// ===== SOLUTION: Single Number =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. XOR all elements              │ O(n)  │ O(1)  │ BEST      │
// │ 2. Hash set                      │ O(n)  │ O(n)  │ Intuitive │
// │ 3. Sum trick: 2·sum(set)−sum(arr)│ O(n)  │ O(n)  │ Same as #2│
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: XOR (BEST — O(1) space) -----
// a ^ a = 0; a ^ 0 = a. XOR is commutative and associative, so order
// doesn't matter. Duplicates cancel; the lone element survives.
function singleNumber(nums) {
  let result = 0;
  for (const x of nums) result ^= x;
  return result;
}

// ----- Approach 2: Hash set -----
// If seen, remove. If not, add. The single element survives.
function singleNumberSet(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) seen.delete(x);
    else seen.add(x);
  }
  return [...seen][0];
}

// ----- Approach 3: Sum trick -----
// 2 × sum(unique) − sum(all) = 2·(a + b + c) − (a + a + b + b + c) = c (the single).
function singleNumberSum(nums) {
  const unique = new Set(nums);
  let sumU = 0, sumA = 0;
  for (const x of unique) sumU += x;
  for (const x of nums) sumA += x;
  return 2 * sumU - sumA;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (XOR) — BEST ---");
test("Three",    singleNumber([2,2,1]),     1);
test("Five",     singleNumber([4,1,2,1,2]), 4);
test("Single",   singleNumber([1]),         1);
test("Negative", singleNumber([-1,-1,-2]), -2);
console.log("--- Approach 2 (Hash set) ---");
test("Five (set)", singleNumberSet([4,1,2,1,2]), 4);
console.log("--- Approach 3 (Sum trick) ---");
test("Five (sum)", singleNumberSum([4,1,2,1,2]), 4);

// ===== When to pick which =====
// - DEFAULT → XOR. O(1) space, two-line implementation.
//   Beautifully generalizes to "every element three times except one":
//   bitwise count modulo 3, slightly more code but same idea.
// - Hash set → more intuitive ("track what you've seen"); requires O(n) memory.
// - Sum trick → cute but uses O(n) memory AND overflows on huge inputs
//   in fixed-width integer languages. Skip unless overflow doesn't matter.
//
// FOLLOW-UP — "every element appears THREE TIMES except one":
//   See the "Single Number II" challenge. XOR alone doesn't work
//   (XOR cancels mod 2; you'd need mod 3). The fix: count each bit
//   across all numbers, take mod 3, reassemble.`,"Single Number II":`// ===== SOLUTION: Single Number II =====
// Every element appears 3 times except one (which appears once). Find it.
// O(n) time, O(1) space.
//
// ┌──────────────────────────────────────┬───────────┬───────┬─────────────┐
// │ Approach                             │ Time      │ Space │ Verdict     │
// ├──────────────────────────────────────┼───────────┼───────┼─────────────┤
// │ 1. Bit-counting mod 3 (32 passes)    │ O(32·n)   │ O(1)  │ Most clear  │
// │ 2. Two-bit state machine (ones/twos) │ O(n)      │ O(1)  │ BEST (1 pass)│
// │ 3. Hash map count == 1               │ O(n)      │ O(n)  │ Intuitive   │
// └──────────────────────────────────────┴───────────┴───────┴─────────────┘
//
// WHY XOR FAILS HERE:
// In "Single Number" (every elem twice), XOR works because XOR is
// addition mod 2 on each bit — pairs cancel to 0, the singleton survives.
// Here every element appears THREE times. Mod 2 of 3 is 1 (not 0), so
// XOR'ing triples leaves the bits set just like a singleton would.
// You need MOD 3 arithmetic on each bit, not mod 2.

// ----- Approach 1: Bit-counting mod 3 (most clear) -----
// For each of the 32 bit positions:
//   - sum (count) how many numbers have that bit set
//   - take count % 3 → triples contribute 0; singleton contributes 1
//   - if remainder is 1, the answer has that bit set
// Reassemble all 32 bits → the lone element.
function singleNumberII(nums) {
  let result = 0;
  for (let bit = 0; bit < 32; bit++) {
    let sum = 0;
    for (const x of nums) sum += (x >> bit) & 1;
    if (sum % 3 !== 0) result |= (1 << bit);
  }
  // JS bitwise ops produce signed 32-bit integers. If the high bit
  // (bit 31) was set, the result is already correctly negative — no fix needed.
  return result;
}

// ----- Approach 2: Two-bit state machine (BEST — single pass) -----
// Maintain two integers: 'ones' (bits that appeared 1 mod 3 times) and
// 'twos' (bits that appeared 2 mod 3 times). On each number x, transition:
//   ones = (ones ^ x) & ~twos
//   twos = (twos ^ x) & ~ones
// After all numbers, 'ones' holds bits that appeared 1 mod 3 times — that's the singleton.
//
// Why this works (truth-table proof for one bit):
//   state (ones, twos) | input bit | next (ones, twos)
//   ─────────────────────────────────────────────────
//      (0, 0)          |    0      |    (0, 0)      seen 0 times still
//      (0, 0)          |    1      |    (1, 0)      → 1 time
//      (1, 0)          |    0      |    (1, 0)      no change
//      (1, 0)          |    1      |    (0, 1)      → 2 times
//      (0, 1)          |    0      |    (0, 1)      no change
//      (0, 1)          |    1      |    (0, 0)      → 3 times, reset
// After processing all numbers, the singleton bits are in 'ones'.
function singleNumberII_state(nums) {
  let ones = 0, twos = 0;
  for (const x of nums) {
    ones = (ones ^ x) & ~twos;
    twos = (twos ^ x) & ~ones;
  }
  return ones;
}

// ----- Approach 3: Hash map count -----
// Count each element. Return the one whose count is 1. Easy to write,
// uses O(n) memory. Useful when constants matter and bit tricks don't.
function singleNumberII_map(nums) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  for (const [k, v] of count) if (v === 1) return k;
  return -1;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Bit-count mod 3) — easiest to explain ---");
test("Four",      singleNumberII([2,2,3,2]),        3);
test("Seven",     singleNumberII([0,1,0,1,0,1,99]), 99);
test("Single",    singleNumberII([7]),              7);
test("Negative",  singleNumberII([-2,-2,1,1,-3,1,-3,-3,-4,-2]), -4);
test("Large bit", singleNumberII([1,1,1,2147483646]), 2147483646);

console.log("--- Approach 2 (State machine) — BEST single-pass ---");
test("Four (sm)",     singleNumberII_state([2,2,3,2]),       3);
test("Seven (sm)",    singleNumberII_state([0,1,0,1,0,1,99]),99);
test("Negative (sm)", singleNumberII_state([-2,-2,1,1,-3,1,-3,-3,-4,-2]), -4);

console.log("--- Approach 3 (Hash map) ---");
test("Four (map)", singleNumberII_map([2,2,3,2]), 3);

// ===== When to pick which =====
// - INTERVIEW DEFAULT → Approach 1 (bit-count mod 3). Easy to derive on
//   the spot, easy to verbalize: "I'll generalize XOR to mod 3 per bit."
// - SHOWCASE → Approach 2 (state machine). Single pass, beautiful when
//   you can defend the truth table. Risky if you can't derive it cleanly.
// - PRAGMATIC → Approach 3 (hash map). When O(n) space is fine, this is
//   the most readable and generalizes to "appears K times except one" trivially.
//
// GENERALIZATION → "every element appears K times except one which appears P times":
//   Use bit-count mod K. The bits of the lone element are exactly the
//   positions where (count of set bits) % K !== 0 — actually equals P
//   if P < K. The state machine generalizes too but needs ⌈log₂ K⌉ state bits.`,"Majority Element":`// ===== SOLUTION: Majority Element =====
//
// ┌──────────────────────────────────┬───────────┬───────┬───────────┐
// │ Approach                         │ Time      │ Space │ Verdict   │
// ├──────────────────────────────────┼───────────┼───────┼───────────┤
// │ 1. Boyer-Moore voting            │ O(n)      │ O(1)  │ BEST      │
// │ 2. Hash map count                │ O(n)      │ O(n)  │ Intuitive │
// │ 3. Sort + middle element         │ O(n log n)│ O(1)  │ Cute      │
// │ 4. Bit-by-bit (majority bit)     │ O(n·32)   │ O(1)  │ Showy     │
// └──────────────────────────────────┴───────────┴───────┴───────────┘

// ----- Approach 1: Boyer-Moore voting (BEST) -----
// Pairs of (majority, non-majority) cancel; the majority outnumbers
// everything else combined, so its candidate survives.
function majorityElement(nums) {
  let candidate = null, count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += (x === candidate ? 1 : -1);
  }
  return candidate;
}

// ----- Approach 2: Hash map count -----
// Count each element; return the one whose count > n/2.
function majorityElementMap(nums) {
  const count = new Map();
  for (const x of nums) {
    count.set(x, (count.get(x) || 0) + 1);
    if (count.get(x) > nums.length / 2) return x;
  }
  return -1;
}

// ----- Approach 3: Sort + middle -----
// After sorting, the majority element MUST occupy index n/2 (since it
// covers more than half the array).
function majorityElementSort(nums) {
  nums.sort((a, b) => a - b);
  return nums[Math.floor(nums.length / 2)];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Boyer-Moore) — BEST ---");
test("Three",    majorityElement([3,2,3]),         3);
test("Seven",    majorityElement([2,2,1,1,1,2,2]), 2);
test("Single",   majorityElement([42]),            42);
test("All same", majorityElement([5,5,5,5]),       5);
console.log("--- Approach 2 (Hash map) ---");
test("Seven (map)", majorityElementMap([2,2,1,1,1,2,2]), 2);
console.log("--- Approach 3 (Sort + middle) ---");
test("Seven (sort)", majorityElementSort([2,2,1,1,1,2,2]), 2);

// ===== When to pick which =====
// - DEFAULT → Boyer-Moore. The only O(1)-space solution. Famous algorithm
//   worth memorizing — generalizes to "find element occurring > n/k times"
//   with k-1 candidates.
// - Hash map → easiest to explain on whiteboard.
// - Sort + middle → one-liner, but O(n log n) wastes work.
// - Bit-by-bit → for each bit position, count how many nums have it set;
//   if > n/2, that bit is in the answer. 32 passes, neat but slower.`,"Product of Array Except Self":`// ===== SOLUTION: Product of Array Except Self =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Two passes, O(1) extra space  │ O(n)  │ O(1)* │ BEST      │
// │ 2. Left + right product arrays   │ O(n)  │ O(n)  │ Easier read│
// │ 3. With division (FORBIDDEN)     │ O(n)  │ O(1)  │ Doesn't handle zeros│
// └──────────────────────────────────┴───────┴───────┴───────────┘
// * besides the output array

// ----- Approach 1: Two passes, output-as-running-products (BEST) -----
// Pass 1 (L→R): out[i] = product of everything LEFT of i.
// Pass 2 (R→L): multiply out[i] by a running 'right' product.
function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n);
  out[0] = 1;
  for (let i = 1; i < n; i++) out[i] = out[i - 1] * nums[i - 1];
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}

// ----- Approach 2: Separate left[] and right[] arrays -----
// Same complexity, easier to explain. Uses O(n) extra space.
function productExceptSelfTwoArrays(nums) {
  const n = nums.length;
  const left = new Array(n), right = new Array(n);
  left[0] = 1;
  for (let i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
  right[n - 1] = 1;
  for (let i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = left[i] * right[i];
  return out;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Two passes, O(1) space) — BEST ---");
test("Standard",  productExceptSelf([1,2,3,4]),       [24,12,8,6]);
test("With zero", productExceptSelf([-1,1,0,-3,3]),   [0,0,9,0,0]);
test("Two zeros", productExceptSelf([0,0,1,2]),       [0,0,0,0]);
test("Pair",      productExceptSelf([3,5]),           [5,3]);
console.log("--- Approach 2 (Two arrays) ---");
test("Standard (arrays)", productExceptSelfTwoArrays([1,2,3,4]), [24,12,8,6]);

// ===== When to pick which =====
// - DEFAULT → Two passes with output-as-running. O(1) extra space (the
//   prompt typically asks for this).
// - Two-array version → useful as a teaching first draft before
//   optimizing to one array. Same asymptotic complexity.
// - Division approach FAILS: arrays with one zero need special-case logic
//   (out[zeroIdx] = product of rest, all others 0). Arrays with multiple
//   zeros are all zeros. The two-pass trick handles both naturally.`,"Plus One":`// ===== SOLUTION: Plus One =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Right-to-left carry walk      │ O(n)  │ O(1)  │ BEST      │
// │ 2. BigInt round-trip             │ O(n)  │ O(n)  │ Cheating  │
// │ 3. Reduce with carry state       │ O(n)  │ O(n)  │ FP-style  │
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Right-to-left carry (BEST) -----
// If digit < 9, increment and return. If 9, set to 0 and continue.
// If we walk off the left while still carrying, prepend a 1.
function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) { digits[i]++; return digits; }
    digits[i] = 0;
  }
  return [1, ...digits];
}

// ----- Approach 2: BigInt round-trip -----
// digits → number → +1 → digits. JS numbers lose precision past 2⁵³;
// use BigInt for safety on long arrays.
function plusOneBigInt(digits) {
  const n = BigInt(digits.join("")) + 1n;
  return String(n).split("").map(Number);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Right-to-left carry) — BEST ---");
test("Simple",     plusOne([1,2,3]),    [1,2,4]);
test("All nines",  plusOne([9,9,9]),    [1,0,0,0]);
test("Single 9",   plusOne([9]),        [1,0]);
test("Trailing 9", plusOne([1,2,9]),    [1,3,0]);
test("Zero",       plusOne([0]),        [1]);
console.log("--- Approach 2 (BigInt) ---");
test("All nines (BigInt)", plusOneBigInt([9,9,9]), [1,0,0,0]);
test("Long (BigInt)",      plusOneBigInt([1,2,3,4,5,6,7,8,9]), [1,2,3,4,5,6,7,9,0]);

// ===== When to pick which =====
// - DEFAULT → Right-to-left carry. O(1) space, no string/BigInt overhead,
//   handles all edge cases (all-nines triggers the prepend).
// - BigInt round-trip → quick & dirty for one-off scripts. Reveals you
//   missed the point of the exercise in an interview.
// - FP reduce → about the same complexity as the carry walk, uglier code.`,"Subarray Sum Equals K":`// ===== SOLUTION: Subarray Sum Equals K =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Prefix sums + hash map        │ O(n)  │ O(n)  │ BEST      │
// │ 2. Sliding window (positive only)│ O(n)  │ O(1)  │ Won't fit │
// │ 3. Brute force                   │ O(n²) │ O(1)  │ Don't ship│
// └──────────────────────────────────┴───────┴───────┴───────────┘

// ----- Approach 1: Prefix sum + hash map (BEST) -----
// Subarray sum (i..j] = S[j] − S[i]. We want S[j] − S[i] = k, i.e. S[i] = S[j] − k.
// At each j, look up how many prior prefixes equal S[j] − k.
function subarraySum(nums, k) {
  const sums = new Map([[0, 1]]);
  let S = 0, count = 0;
  for (const x of nums) {
    S += x;
    if (sums.has(S - k)) count += sums.get(S - k);
    sums.set(S, (sums.get(S) || 0) + 1);
  }
  return count;
}

// ----- Approach 2: Brute force (BASELINE) -----
// Every (i, j) pair, sum the slice. Verifies correctness of #1.
function subarraySumBrute(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum === k) count++;
    }
  }
  return count;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name, actual === expected ? "" : \`Expected \${expected}, got \${actual}\`);
};
console.log("--- Approach 1 (Prefix sum + hash) — BEST ---");
test("Standard",     subarraySum([1,1,1], 2),       2);
test("Pair sum",     subarraySum([1,2,3], 3),       2);
test("All k",        subarraySum([1,1,1,1], 2),     3);
test("Negatives",    subarraySum([1,-1,0], 0),      3);
test("None",         subarraySum([1,2,3], 7),       0);
test("Single match", subarraySum([5], 5),           1);
console.log("--- Approach 2 (Brute force) ---");
test("Standard (brute)",  subarraySumBrute([1,1,1], 2), 2);
test("Negatives (brute)", subarraySumBrute([1,-1,0], 0), 3);

// ===== When to pick which =====
// - DEFAULT → Prefix sum + hash. The canonical pattern, handles negatives.
// - Sliding window only works for ALL-POSITIVE inputs; negatives break the
//   "shrink left when sum > k" invariant.
// - Brute force confirms correctness on small inputs; never ships.`,"Search in Rotated Sorted Array":`// ===== SOLUTION: Search in Rotated Sorted Array =====
//
// ┌──────────────────────────────────┬───────────┬───────┬───────────┐
// │ Approach                         │ Time      │ Space │ Verdict   │
// ├──────────────────────────────────┼───────────┼───────┼───────────┤
// │ 1. Modified binary search        │ O(log n)  │ O(1)  │ BEST      │
// │ 2. Find pivot + standard search  │ 2·O(log n)│ O(1)  │ Cleaner   │
// │ 3. Linear scan                   │ O(n)      │ O(1)  │ Don't ship│
// └──────────────────────────────────┴───────────┴───────┴───────────┘

// ----- Approach 1: Single-pass modified binary search (BEST) -----
// At each mid, ONE half is sorted. Identify which side via nums[lo] ≤ nums[mid].
// Check if target lies within that sorted half; recurse into the right side.
function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {           // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

// ----- Approach 2: Find pivot, then standard binary search -----
// Two binary searches: first finds the rotation pivot; second searches
// in the relevant sorted half. Easier to reason about correctness.
function searchRotatedTwoPass(nums, target) {
  if (nums.length === 0) return -1;
  // Find smallest element (pivot) via binary search.
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  const pivot = lo;
  // Decide which half contains target.
  const n = nums.length;
  let left = 0, right = n - 1;
  if (target >= nums[pivot] && target <= nums[n - 1]) { left = pivot; right = n - 1; }
  else { left = 0; right = pivot - 1; }
  while (left <= right) {
    const mid = (left + right) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Single-pass) — BEST ---");
test("Right half",  searchRotated([4,5,6,7,0,1,2], 0), 4);
test("Left half",   searchRotated([4,5,6,7,0,1,2], 5), 1);
test("Not found",   searchRotated([4,5,6,7,0,1,2], 3), -1);
test("Empty",       searchRotated([], 1),              -1);
test("Single, hit", searchRotated([1], 1),             0);
test("Not rotated", searchRotated([1,2,3,4,5], 3),     2);
test("Rotated 1",   searchRotated([5,1,2,3,4], 1),     1);
console.log("--- Approach 2 (Find pivot + search) ---");
test("Right half (2p)",  searchRotatedTwoPass([4,5,6,7,0,1,2], 0), 4);
test("Left half (2p)",   searchRotatedTwoPass([4,5,6,7,0,1,2], 5), 1);
test("Not found (2p)",   searchRotatedTwoPass([4,5,6,7,0,1,2], 3), -1);

// ===== When to pick which =====
// - DEFAULT → Single-pass. Strictly O(log n), one binary search.
//   Half the code of the two-pass version.
// - Two-pass → conceptually simpler ("find pivot, then standard search").
//   Same Big-O, slightly more total iterations. Use if you find the
//   single-pass off-by-ones tricky.
// - Linear scan → only for tiny inputs or as a correctness check.`,"Spiral Matrix":`// ===== SOLUTION: Spiral Matrix =====
//
// ┌──────────────────────────────────┬─────────┬───────┬───────────┐
// │ Approach                         │ Time    │ Space │ Verdict   │
// ├──────────────────────────────────┼─────────┼───────┼───────────┤
// │ 1. Four-boundary cursors         │ O(m·n)  │ O(1)  │ BEST      │
// │ 2. Direction vector + visited[]  │ O(m·n)  │ O(m·n)│ More general│
// │ 3. Layer-by-layer recursion      │ O(m·n)  │ O(min(m,n))│ Showy │
// └──────────────────────────────────┴─────────┴───────┴───────────┘

// ----- Approach 1: Four-boundary cursors (BEST) -----
// top / bottom / left / right shrink inward each cycle.
function spiralOrder(matrix) {
  if (matrix.length === 0) return [];
  const out = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);
      left++;
    }
  }
  return out;
}

// ----- Approach 2: Direction vector + visited[] -----
// Walk with (dr, dc); turn right when next cell is out-of-bounds or visited.
function spiralOrderDir(matrix) {
  if (matrix.length === 0) return [];
  const m = matrix.length, n = matrix[0].length;
  const out = [], seen = Array.from({ length: m }, () => new Array(n).fill(false));
  const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
  let r = 0, c = 0, d = 0;
  for (let i = 0; i < m * n; i++) {
    out.push(matrix[r][c]);
    seen[r][c] = true;
    const nr = r + dr[d], nc = c + dc[d];
    if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) {
      d = (d + 1) % 4;        // turn right
    }
    r += dr[d]; c += dc[d];
  }
  return out;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Four boundaries) — BEST ---");
test("3x3",        spiralOrder([[1,2,3],[4,5,6],[7,8,9]]),          [1,2,3,6,9,8,7,4,5]);
test("3x4",        spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), [1,2,3,4,8,12,11,10,9,5,6,7]);
test("Single row", spiralOrder([[1,2,3,4]]),                         [1,2,3,4]);
test("Single col", spiralOrder([[1],[2],[3]]),                       [1,2,3]);
test("Empty",      spiralOrder([]),                                  []);
test("1x1",        spiralOrder([[42]]),                              [42]);
console.log("--- Approach 2 (Direction vector) ---");
test("3x3 (dir)", spiralOrderDir([[1,2,3],[4,5,6],[7,8,9]]), [1,2,3,6,9,8,7,4,5]);
test("3x4 (dir)", spiralOrderDir([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), [1,2,3,4,8,12,11,10,9,5,6,7]);

// ===== When to pick which =====
// - DEFAULT → Four boundaries. O(1) extra space, slightly less arithmetic
//   per step. The conditional guards (top<=bottom, left<=right) on
//   passes 3-4 prevent double-traversal on non-square matrices.
// - Direction vector → cleaner conceptually; readily extends to "spiral
//   from center outward" or "fill matrix in spiral order". Uses O(m·n)
//   for the visited array.
// - Recursive layer-by-layer → showy; ~2× the code. Same asymptotic.`,"Find Maximum in Array":`// ===== SOLUTION: Find Maximum in Array =====
//
// ┌──────────────────────────────────┬───────┬───────┬───────────┐
// │ Approach                         │ Time  │ Space │ Verdict   │
// ├──────────────────────────────────┼───────┼───────┼───────────┤
// │ 1. Single-pass running max       │ O(n)  │ O(1)  │ BEST      │
// │ 2. reduce((m, x) => max(m, x))   │ O(n)  │ O(1)  │ Functional│
// │ 3. Math.max(...arr)              │ O(n)  │ O(n)* │ Stack risk│
// │ 4. Sort + last element           │ O(n log n)│ O(1)│ Wasteful│
// └──────────────────────────────────┴───────┴───────┴───────────┘
// * spread can blow the call stack on huge arrays (~10⁵+ elements)

// ----- Approach 1: Single-pass running max (BEST) -----
function findMax(nums) {
  if (nums.length === 0) return null;
  let max = -Infinity;
  for (const x of nums) if (x > max) max = x;
  return max;
}

// ----- Approach 2: reduce — functional style -----
function findMaxReduce(nums) {
  if (nums.length === 0) return null;
  return nums.reduce((m, x) => (x > m ? x : m), -Infinity);
}

// ----- Approach 3: Math.max + spread (one-liner) -----
function findMaxSpread(nums) {
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Running max) — BEST ---");
test("Mixed",        findMax([3, 7, 1, 9, 4]),    9);
test("All negative", findMax([-5, -2, -8, -1]),   -1);
test("Single",       findMax([42]),                42);
test("All same",     findMax([5, 5, 5]),           5);
test("With neg",     findMax([-3, 0, 5, -1]),      5);
test("Empty",        findMax([]),                  null);
console.log("--- Approach 2 (reduce) ---");
test("Mixed (reduce)", findMaxReduce([3, 7, 1, 9, 4]), 9);
console.log("--- Approach 3 (Math.max spread) ---");
test("Mixed (spread)", findMaxSpread([3, 7, 1, 9, 4]), 9);

// ===== When to pick which =====
// - DEFAULT → Single-pass loop. Safe at any size, no allocation.
// - reduce → most idiomatic JS for small/medium arrays.
// - Math.max + spread → most readable one-liner BUT risky for arrays
//   over ~10⁵ elements (the spread expands to that many stack args
//   and can throw "Maximum call stack size exceeded").
// - Sort + last → O(n log n) waste; never pick this.`,"Find Min and Max":`// ===== SOLUTION: Find Min and Max =====
//
// ┌──────────────────────────────────┬───────────┬───────┬───────────┐
// │ Approach                         │ Comparisons│ Space │ Verdict   │
// ├──────────────────────────────────┼───────────┼───────┼───────────┤
// │ 1. Single pass, 2 comparisons/x  │ 2n        │ O(1)  │ BEST      │
// │ 2. Pairwise — 3n/2 comparisons   │ 3n/2 − 2  │ O(1)  │ Optimal   │
// │ 3. Two separate Math.max/.min    │ 2n        │ O(n)* │ Spread risk│
// │ 4. Sort + take ends              │ O(n log n)│ O(1)  │ Wasteful  │
// └──────────────────────────────────┴───────────┴───────┴───────────┘

// ----- Approach 1: Single pass, two checks per element (BEST) -----
function findMinMax(nums) {
  if (nums.length === 0) return { min: null, max: null };
  let min = Infinity, max = -Infinity;
  for (const x of nums) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return { min, max };
}

// ----- Approach 2: Pairwise — 3n/2 comparisons (OPTIMAL) -----
// Process two elements at a time. First compare the pair (1 cmp), then
// the smaller of the pair vs min (1 cmp), and the larger vs max (1 cmp).
// Three comparisons per two elements = 3n/2 total — provably optimal.
function findMinMaxPairwise(nums) {
  if (nums.length === 0) return { min: null, max: null };
  let min, max, i = 0;
  if (nums.length % 2 === 1) {
    min = max = nums[0];
    i = 1;
  } else {
    if (nums[0] < nums[1]) { min = nums[0]; max = nums[1]; }
    else { min = nums[1]; max = nums[0]; }
    i = 2;
  }
  while (i < nums.length) {
    let a = nums[i], b = nums[i + 1];
    if (a > b) [a, b] = [b, a];
    if (a < min) min = a;
    if (b > max) max = b;
    i += 2;
  }
  return { min, max };
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(JSON.stringify(actual) === JSON.stringify(expected) ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Single pass) — BEST ---");
test("Mixed",        findMinMax([3, 7, 1, 9, 4]),  { min: 1, max: 9 });
test("All negative", findMinMax([-5, -2, -8, -1]), { min: -8, max: -1 });
test("Single",       findMinMax([42]),             { min: 42, max: 42 });
test("All same",     findMinMax([5, 5, 5]),        { min: 5, max: 5 });
test("Two",          findMinMax([10, 3]),          { min: 3, max: 10 });
test("Empty",        findMinMax([]),               { min: null, max: null });
console.log("--- Approach 2 (Pairwise, 3n/2 comparisons) ---");
test("Mixed (pair)", findMinMaxPairwise([3, 7, 1, 9, 4]), { min: 1, max: 9 });
test("Even count",   findMinMaxPairwise([10, 3, 8, 1]),   { min: 1, max: 10 });
test("Empty (pair)", findMinMaxPairwise([]),              { min: null, max: null });

// ===== When to pick which =====
// - DEFAULT → Single pass. Simpler code; in modern engines the branch
//   predictor makes the extra comparison nearly free.
// - Pairwise (3n/2) → optimal comparison count, but the win is microscopic
//   on real hardware. Worth knowing for academic completeness.
// - Two separate Math.min/Math.max → two passes; spread can blow stack.`,"Third Largest Number":`// ===== SOLUTION: Third Largest Number =====
//
// ┌──────────────────────────────────┬───────────┬───────┬───────────┐
// │ Approach                         │ Time      │ Space │ Verdict   │
// ├──────────────────────────────────┼───────────┼───────┼───────────┤
// │ 1. Three sentinels               │ O(n)      │ O(1)  │ BEST      │
// │ 2. Set + sort desc, take [2]     │ O(n log n)│ O(n)  │ One-liner │
// │ 3. Min-heap of size 3            │ O(n log 3)│ O(3)  │ Generic   │
// └──────────────────────────────────┴───────────┴───────┴───────────┘

// ----- Approach 1: Three sentinels (BEST) -----
// Track first/second/third with -Infinity defaults. On each x: skip if
// equal to any sentinel (must be DISTINCT). Else cascade-shift values.
function thirdLargest(nums) {
  let first = -Infinity, second = -Infinity, third = -Infinity;
  for (const x of nums) {
    if (x === first || x === second || x === third) continue;
    if (x > first) { third = second; second = first; first = x; }
    else if (x > second) { third = second; second = x; }
    else if (x > third) third = x;
  }
  return third === -Infinity ? first : third;
}

// ----- Approach 2: Set + sort desc, take index 2 -----
// Three readable lines. Use when n is small.
function thirdLargestSort(nums) {
  const unique = [...new Set(nums)].sort((a, b) => b - a);
  return unique.length < 3 ? unique[0] : unique[2];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Three sentinels) — BEST ---");
test("Three",       thirdLargest([3, 2, 1]),         1);
test("Fewer",       thirdLargest([1, 2]),            2);
test("Duplicates",  thirdLargest([2, 2, 3, 1]),      1);
test("All same",    thirdLargest([5, 5, 5]),         5);
test("Larger",      thirdLargest([1, 2, 2, 5, 3, 5]), 2);
test("Single",      thirdLargest([42]),              42);
console.log("--- Approach 2 (Set + sort) ---");
test("Larger (sort)", thirdLargestSort([1, 2, 2, 5, 3, 5]), 2);
test("Duplicates (sort)", thirdLargestSort([2, 2, 3, 1]),    1);

// ===== When to pick which =====
// - DEFAULT → Three sentinels. O(n) time, O(1) space, single pass.
//   Senior interviewers want this — shows you can manage the
//   "must-be-distinct" edge case carefully.
// - Set + sort → most readable. Fine for n ≤ 10⁴.
// - Min-heap of size 3 → generalizes to kᵗʰ largest unique (size k).`,"Kth Largest Element":`// ===== SOLUTION: Kth Largest Element =====
//
// ┌──────────────────────────────────┬───────────┬───────┬───────────┐
// │ Approach                         │ Time      │ Space │ Verdict   │
// ├──────────────────────────────────┼───────────┼───────┼───────────┤
// │ 1. Sort + index                  │ O(n log n)│ O(1)  │ Simplest  │
// │ 2. Min-heap of size k            │ O(n log k)│ O(k)  │ Streaming │
// │ 3. Quickselect (Hoare partition) │ O(n) avg  │ O(1)  │ BEST asymptotic│
// └──────────────────────────────────┴───────────┴───────┴───────────┘

// ----- Approach 1: Sort + index (SIMPLEST) -----
// Sort ascending; the k-th largest sits at index n-k.
function kthLargest(nums, k) {
  nums.sort((a, b) => a - b);
  return nums[nums.length - k];
}

// ----- Approach 2: Min-heap of size k (good for streaming) -----
// Maintain a heap of the top k candidates. On overflow, drop the smallest.
// (JS has no native heap; we emulate via a sorted insertion to keep it short.)
function kthLargestHeap(nums, k) {
  const heap = [];
  for (const x of nums) {
    // Insert x in sorted order, drop smallest when size exceeds k.
    let i = heap.length;
    heap.push(x);
    while (i > 0 && heap[i] < heap[i - 1]) {
      [heap[i], heap[i - 1]] = [heap[i - 1], heap[i]];
      i--;
    }
    if (heap.length > k) heap.shift();
  }
  return heap[0];   // smallest among the k largest
}

// ----- Approach 3: Quickselect (O(n) average) -----
// Pick a pivot, partition like quicksort. Recurse into the side that
// contains the target index. O(n) average; O(n²) worst with bad pivots.
function kthLargestQS(nums, k) {
  const target = nums.length - k;   // index in ascending order
  function select(lo, hi) {
    if (lo === hi) return nums[lo];
    const pivot = nums[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (nums[j] <= pivot) {
        [nums[i], nums[j]] = [nums[j], nums[i]];
        i++;
      }
    }
    [nums[i], nums[hi]] = [nums[hi], nums[i]];
    if (i === target) return nums[i];
    if (i < target) return select(i + 1, hi);
    return select(lo, i - 1);
  }
  return select(0, nums.length - 1);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  console.log(actual === expected ? "✅" : "❌", name);
};
console.log("--- Approach 1 (Sort + index) ---");
test("k=2",            kthLargest([3,2,1,5,6,4], 2),         5);
test("k=4 with dups",  kthLargest([3,2,3,1,2,4,5,5,6], 4),   4);
test("k=1 (largest)",  kthLargest([3,2,1], 1),               3);
test("k=n (smallest)", kthLargest([3,2,1], 3),               1);
test("Negatives",      kthLargest([-1, -2, -3], 2),         -2);
test("Single",         kthLargest([42], 1),                  42);
console.log("--- Approach 2 (Heap of size k) ---");
test("k=2 (heap)", kthLargestHeap([3,2,1,5,6,4], 2),         5);
test("k=4 dups (heap)", kthLargestHeap([3,2,3,1,2,4,5,5,6], 4), 4);
console.log("--- Approach 3 (Quickselect) — BEST asymptotic ---");
test("k=2 (QS)", kthLargestQS([3,2,1,5,6,4], 2),         5);
test("k=4 dups (QS)", kthLargestQS([3,2,3,1,2,4,5,5,6], 4), 4);

// ===== When to pick which =====
// - DEFAULT → Sort + index. O(n log n) but tiny constants; fine for n ≤ 10⁵.
// - Heap of size k → best when k ≪ n (e.g., top 10 from a stream of 10⁶).
//   Reads each element once, never holds more than k.
// - Quickselect → asymptotically optimal at O(n) average. Worst case O(n²)
//   with adversarial pivots — randomize the pivot to mitigate. Pick when
//   the interviewer explicitly asks for O(n).`,"Find Peak Element":`// ===== SOLUTION: Find Peak Element =====
// Binary search. If nums[mid] > nums[mid+1], peak is on left (including mid).
function findPeak(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[mid + 1]) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
const test = (name, actual, validIndices) => {
  console.log(validIndices.includes(actual) ? "✅" : "❌", name);
};
test("Single peak",  findPeak([1, 2, 3, 1]),                 [2]);
test("Two peaks",    findPeak([1, 2, 1, 3, 5, 6, 4]),        [1, 5]);
test("Single",       findPeak([42]),                          [0]);
test("Strictly inc", findPeak([1, 2, 3, 4, 5]),               [4]);
test("Strictly dec", findPeak([5, 4, 3, 2, 1]),               [0]);
test("Two elements", findPeak([1, 2]),                        [1]);`};export{e as playgroundSolutions};
