const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/babel-DgCu6knF.js","assets/react-DjIRecv2.js"])))=>i.map(i=>d[i]);
import{i as ie,_ as le}from"./index-aEtgWlL1.js";import{j as e}from"./markdown-CeGWf6fF.js";import{r as s,R as d,L as ce}from"./react-DjIRecv2.js";import{o as de,B as q,p as J,X as W,g as ue,q as pe,A as me,r as ge,h as fe,s as he,P as ye}from"./icons-DEJKdjRl.js";import{A as be,m as G}from"./motion-DY3Ty_rV.js";const V={"Two Sum":`// ===== SOLUTION: Two Sum =====
// Approach: hash map of (value -> index). For each n, check if
// (target - n) was already seen. O(n) time, O(n) space.

function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Example 1", twoSum([2, 7, 11, 15], 9), [0, 1]);
test("Example 2", twoSum([3, 2, 4], 6), [1, 2]);
test("Example 3", twoSum([3, 3], 6), [0, 1]);`,"Reverse String":`// ===== SOLUTION: Reverse String =====
// Two-pointer approach: swap from both ends inward.
// Could also do: split('').reduceRight((a, c) => a + c, "")

function reverseString(str) {
  const arr = str.split("");
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  return arr.join("");
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple word", reverseString("hello"), "olleh");
test("Another word", reverseString("world"), "dlrow");
test("Single char", reverseString("a"), "a");
test("Empty string", reverseString(""), "");
test("Palindrome", reverseString("racecar"), "racecar");`,"Valid Palindrome":`// ===== SOLUTION: Valid Palindrome =====
// Strip non-alphanumeric, lowercase, two-pointer compare.

function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++; right--;
  }
  return true;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Classic palindrome", isPalindrome("A man, a plan, a canal: Panama"), true);
test("Not a palindrome", isPalindrome("race a car"), false);
test("Empty string", isPalindrome(""), true);
test("Single char", isPalindrome("a"), true);
test("With numbers", isPalindrome("0P"), false);`,FizzBuzz:`// ===== SOLUTION: FizzBuzz =====
// Standard interview answer: check divisibility by 15 first.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("First 5", fizzBuzz(5), ["1", "2", "Fizz", "4", "Buzz"]);
test("First 15", fizzBuzz(15), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]);
test("Just 1", fizzBuzz(1), ["1"]);
test("FizzBuzz at 30", fizzBuzz(30).slice(-1), ["FizzBuzz"]);`,"Max Profit":`// ===== SOLUTION: Max Profit (Best Time to Buy/Sell Stock) =====
// Track the lowest price seen so far. For each new price,
// the candidate profit is price - minSoFar. Keep the max.

function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) minPrice = price;
    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
  }
  return maxProfit;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Profit possible", maxProfit([7, 1, 5, 3, 6, 4]), 5);
test("Decreasing only", maxProfit([7, 6, 4, 3, 1]), 0);
test("Single price", maxProfit([5]), 0);
test("Empty", maxProfit([]), 0);
test("Two prices, profit", maxProfit([1, 5]), 4);`,"Valid Parentheses":`// ===== SOLUTION: Valid Parentheses =====
// Stack approach: push opens, pop and verify match on closes.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Simple match", isValid("()"), true);
test("Nested mix", isValid("()[]{}"), true);
test("Wrong order", isValid("(]"), false);
test("Mismatched", isValid("([)]"), false);
test("Empty", isValid(""), true);
test("Only opens", isValid("((("), false);`,"Merge Sorted Arrays":`// ===== SOLUTION: Merge Sorted Arrays =====
// Two-pointer merge in O(m + n) time, O(m + n) space.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Equal lengths", merge([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
test("Different lengths", merge([1, 2, 3], [4, 5, 6, 7]), [1, 2, 3, 4, 5, 6, 7]);
test("One empty", merge([], [1, 2, 3]), [1, 2, 3]);
test("Both empty", merge([], []), []);
test("With duplicates", merge([1, 2, 2], [2, 3]), [1, 2, 2, 2, 3]);`,"Flatten Array":`// ===== SOLUTION: Flatten Array =====
// Recursive flatten. depth=Infinity by default; depth=1 = single-level.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Deep nested", flatten([1, [2, [3, [4, [5]]]]]), [1, 2, 3, 4, 5]);
test("Depth 1", flatten([1, [2, [3, [4]]]], 1), [1, 2, [3, [4]]]);
test("Depth 2", flatten([1, [2, [3, [4]]]], 2), [1, 2, 3, [4]]);
test("Already flat", flatten([1, 2, 3]), [1, 2, 3]);
test("Empty", flatten([]), []);`,Debounce:`// ===== SOLUTION: Debounce =====
// Closure captures the timer. Each call cancels the previous and
// reschedules. Function only fires after \`delay\` ms of quiet.

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ===== TEST CASES =====
let counter = 0;
const debouncedIncrement = debounce(() => counter++, 100);

debouncedIncrement();
debouncedIncrement();
debouncedIncrement();

setTimeout(() => {
  console.log(counter === 1 ? "✅" : "❌", \`Expected 1 call, got \${counter}\`);

  setTimeout(() => {
    debouncedIncrement();
    setTimeout(() => {
      debouncedIncrement();
      setTimeout(() => {
        console.log(counter === 2 ? "✅" : "❌", \`After spaced calls expect 2, got \${counter}\`);
      }, 150);
    }, 80);
  }, 80);
}, 150);`,"Group Anagrams":`// ===== SOLUTION: Group Anagrams =====
// Sort each string's letters; same sorted form = same group.
// Map<sortedKey, group[]>.

function groupAnagrams(strs) {
  const groups = new Map();
  for (const word of strs) {
    const key = [...word].sort().join("");
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

test("Mixed anagrams", groupAnagrams(["eat","tea","tan","ate","nat","bat"]), [["eat","tea","ate"],["tan","nat"],["bat"]]);
test("Single string", groupAnagrams(["a"]), [["a"]]);
test("Empty string", groupAnagrams([""]), [[""]]);
test("No anagrams", groupAnagrams(["abc","def","ghi"]), [["abc"],["def"],["ghi"]]);`,"Find Duplicates":`// ===== SOLUTION: Find Duplicates =====
// Single pass with two sets: \`seen\` and \`dups\`. The dups set
// dedupes the result automatically (in case a value appears 3+ times).

function findDuplicates(arr) {
  const seen = new Set();
  const dups = new Set();
  for (const item of arr) {
    if (seen.has(item)) dups.add(item);
    else seen.add(item);
  }
  return [...dups];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const sortIfArr = (a) => Array.isArray(a) ? [...a].sort() : a;
  const pass = JSON.stringify(sortIfArr(actual)) === JSON.stringify(sortIfArr(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Numbers", findDuplicates([1, 2, 3, 2, 4, 3, 5]), [2, 3]);
test("Strings", findDuplicates(["a", "b", "a", "c"]), ["a"]);
test("No duplicates", findDuplicates([1, 2, 3, 4]), []);
test("All same", findDuplicates([7, 7, 7]), [7]);
test("Triple duplicate", findDuplicates([1, 1, 1, 2, 2]), [1, 2]);`,"Remove Duplicates":`// ===== SOLUTION: Remove Duplicates =====
// Hash set tracks seen values; preserve first-seen order via push.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Numbers", removeDuplicates([1, 2, 1, 3, 2, 4]), [1, 2, 3, 4]);
test("Strings", removeDuplicates(["a", "b", "a", "c", "b"]), ["a", "b", "c"]);
test("Already unique", removeDuplicates([1, 2, 3]), [1, 2, 3]);
test("All same", removeDuplicates([5, 5, 5, 5]), [5]);
test("Empty", removeDuplicates([]), []);`,"Find Missing Number":`// ===== SOLUTION: Find Missing Number =====
// Sum trick: expected sum of [0..n] is n*(n+1)/2.
// Subtract actual sum; the difference is the missing number.

function findMissing(nums) {
  const n = nums.length;
  const expected = (n * (n + 1)) / 2;
  const actual = nums.reduce((sum, x) => sum + x, 0);
  return expected - actual;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Missing 2", findMissing([3, 0, 1]), 2);
test("Missing last", findMissing([0, 1]), 2);
test("Missing first", findMissing([1, 2]), 0);
test("Single missing 0", findMissing([1]), 0);
test("Larger array", findMissing([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);`,"Move Zeros":`// ===== SOLUTION: Move Zeros to End =====
// Two-pointer: write index advances only on non-zero. Then fill rest with 0.
// O(n) time, O(1) space.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed", moveZeros([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
test("All zeros", moveZeros([0, 0, 0]), [0, 0, 0]);
test("No zeros", moveZeros([1, 2, 3]), [1, 2, 3]);
test("Single zero", moveZeros([0]), [0]);
test("Zeros first", moveZeros([0, 0, 1, 2]), [1, 2, 0, 0]);`,"Rotate Array":`// ===== SOLUTION: Rotate Array =====
// Slice + concat. k may exceed length, so normalize with k % n first.

function rotate(nums, k) {
  const n = nums.length;
  if (n === 0) return [];
  const shift = k % n;
  return [...nums.slice(n - shift), ...nums.slice(0, n - shift)];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Rotate by 2", rotate([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]);
test("k > length",  rotate([1, 2], 5), [2, 1]);
test("k = 0",        rotate([1, 2, 3], 0), [1, 2, 3]);
test("k = length",   rotate([1, 2, 3], 3), [1, 2, 3]);
test("Single",       rotate([1], 5), [1]);`,"Bubble Sort":`// ===== SOLUTION: Bubble Sort =====
// Repeatedly swap out-of-order adjacent pairs. Early-exit when
// a full pass makes no swaps (best-case O(n)).

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",       bubbleSort([5, 1, 4, 2, 8]), [1, 2, 4, 5, 8]);
test("Reversed",    bubbleSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",      bubbleSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("With duplicates", bubbleSort([3, 1, 2, 3, 1]), [1, 1, 2, 3, 3]);
test("Empty",       bubbleSort([]), []);`,"Quick Sort":`// ===== SOLUTION: Quick Sort =====
// Recursive partition. Pick middle element as pivot to avoid
// worst-case on already-sorted input.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",      quickSort([3, 6, 1, 4, 8, 2]), [1, 2, 3, 4, 6, 8]);
test("Reversed",   quickSort([9, 7, 5, 3, 1]), [1, 3, 5, 7, 9]);
test("Sorted",     quickSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("Single",     quickSort([42]), [42]);
test("Duplicates", quickSort([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3]);`,"Merge Sort":`// ===== SOLUTION: Merge Sort =====
// Divide-and-conquer: split in half, recursively sort, merge.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",     mergeSort([5, 2, 8, 1, 9, 3]), [1, 2, 3, 5, 8, 9]);
test("Reversed",  mergeSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",    mergeSort([1, 2, 3]), [1, 2, 3]);
test("Empty",     mergeSort([]), []);
test("Big",       mergeSort([10, -5, 7, 0, 3, 7]), [-5, 0, 3, 7, 7, 10]);`,"Anagram Check":`// ===== SOLUTION: Anagram Check =====
// Frequency-map approach: O(n) time, O(charset) space.
// Increment for s1, decrement for s2. All zeros means anagram.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Classic anagram",   isAnagram("listen", "silent"), true);
test("Not anagram",       isAnagram("hello", "world"),  false);
test("Different lengths", isAnagram("abc", "abcd"),     false);
test("Case insensitive",  isAnagram("Astronomer", "Moon starer"), true);
test("Empty strings",     isAnagram("", ""),             true);`,"Longest Substring":`// ===== SOLUTION: Longest Substring Without Repeating =====
// Sliding window. Map<char, lastIndex>. When we hit a repeat,
// move \`left\` past the previous occurrence (but never backwards).

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("abcabcbb", lengthOfLongestSubstring("abcabcbb"), 3);
test("bbbbb",    lengthOfLongestSubstring("bbbbb"), 1);
test("pwwkew",   lengthOfLongestSubstring("pwwkew"), 3);
test("Empty",    lengthOfLongestSubstring(""), 0);
test("Unique",   lengthOfLongestSubstring("abcdef"), 6);`,"First Non-Repeating Char":`// ===== SOLUTION: First Non-Repeating Character =====
// Two-pass: count frequencies, then scan in original order
// for the first char with count 1.

function firstNonRepeating(s) {
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of s) {
    if (freq[ch] === 1) return ch;
  }
  return null;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("leetcode",     firstNonRepeating("leetcode"), "l");
test("loveleetcode", firstNonRepeating("loveleetcode"), "v");
test("All repeat",   firstNonRepeating("aabb"), null);
test("Single char",  firstNonRepeating("z"), "z");
test("Empty",        firstNonRepeating(""), null);`,"Sum Curry":`// ===== SOLUTION: Sum Curry — sum(1)(2)(3)... =====
// Inner function captures running total. When called with no args,
// returns the total. Otherwise returns itself with the new total.

function sum(a) {
  let total = a;
  function inner(b) {
    if (b === undefined) return total;
    total += b;
    return inner;
  }
  return inner;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Two args",     sum(1)(2)(),          3);
test("Three args",   sum(1)(2)(3)(),       6);
test("Five args",    sum(1)(2)(3)(4)(5)(), 15);
test("Single arg",   sum(42)(),            42);
test("With zero",    sum(0)(0)(5)(),       5);`,Memoize:`// ===== SOLUTION: Memoize =====
// JSON.stringify(args) as cache key. Works for primitive args.
// For objects, you may want a WeakMap-based key strategy.

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

// ===== TEST CASES =====
let computeCount = 0;
const slowDouble = (n) => { computeCount++; return n * 2; };
const fastDouble = memoize(slowDouble);

console.log(fastDouble(5));   // 10  (computed)
console.log(fastDouble(5));   // 10  (cached)
console.log(fastDouble(7));   // 14  (computed)
console.log(fastDouble(5));   // 10  (cached)

console.log(computeCount === 2 ? "✅" : "❌", "Cache hit count: expected 2 computes, got", computeCount);`,"Deep Clone":`// ===== SOLUTION: Deep Clone =====
// Recursively clone arrays/objects. Handle Date, RegExp specially.
// Uses a WeakMap to handle circular references safely.

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
test("Different reference", original === cloned, false);`,Throttle:`// ===== SOLUTION: Throttle =====
// Track last-fire timestamp. Skip calls within the window.

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
}, 150);`,EventEmitter:`// ===== SOLUTION: EventEmitter =====
// Map<eventName, Set<listener>>. Set handles dedup and easy delete.

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

console.log(onceCount === 1 ? "✅" : "❌", \`once should fire 1x, fired \${onceCount}x\`);`,"LRU Cache":`// ===== SOLUTION: LRU Cache =====
// JavaScript Map preserves insertion order. To mark a key as
// most-recent, delete and re-insert it. To evict LRU, take the
// first key from Map keys iterator.

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
console.log(cache.get(4));    // "d"`,"Binary Search":`// ===== SOLUTION: Binary Search =====
// Iterative two-pointer narrowing. O(log n).

function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Found in middle",  binarySearch([-1, 0, 3, 5, 9, 12], 9), 4);
test("Not found",        binarySearch([-1, 0, 3, 5, 9, 12], 2), -1);
test("First element",    binarySearch([1, 2, 3, 4, 5], 1), 0);
test("Last element",     binarySearch([1, 2, 3, 4, 5], 5), 4);
test("Empty array",      binarySearch([], 5), -1);
test("Single element",   binarySearch([42], 42), 0);`,"Roman to Integer":`// ===== SOLUTION: Roman to Integer =====
// Walk left-to-right. If current symbol is smaller than the next,
// subtract it; otherwise add it.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("III",     romanToInt("III"),     3);
test("LVIII",   romanToInt("LVIII"),   58);
test("MCMXCIV", romanToInt("MCMXCIV"), 1994);
test("IV",      romanToInt("IV"),      4);
test("XL",      romanToInt("XL"),      40);`,"Reverse Linked List":`// ===== SOLUTION: Reverse Linked List =====
// Iterative three-pointer pattern. O(n) time, O(1) space.

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
test("Long list",   toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);`,"Container With Most Water":`// ===== SOLUTION: Container With Most Water =====
// Two-pointer. The shorter side limits the area, so move it inward
// in hopes of finding a taller bar. O(n) time, O(1) space.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Standard",  maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
test("Two bars",  maxArea([1, 1]),                       1);
test("Same",      maxArea([4, 4, 4, 4]),                 12);
test("Increasing", maxArea([1, 2, 3, 4, 5]),             6);
test("Single",    maxArea([5]),                          0);`,"Climbing Stairs":`// ===== SOLUTION: Climbing Stairs =====
// f(n) = f(n-1) + f(n-2). Track only last two values for O(1) space.

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

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("n = 1",  climbStairs(1), 1);
test("n = 2",  climbStairs(2), 2);
test("n = 3",  climbStairs(3), 3);
test("n = 4",  climbStairs(4), 5);
test("n = 5",  climbStairs(5), 8);
test("n = 10", climbStairs(10), 89);`,"Compose & Pipe":`// ===== SOLUTION: Compose & Pipe =====
// compose: reduceRight, so args flow right-to-left.
// pipe: reduce, so args flow left-to-right.

function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

function pipe(...fns) {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

const double = (x) => x * 2;
const addOne = (x) => x + 1;
const square = (x) => x * x;

test("compose right-to-left", compose(double, addOne)(3), 8);
test("pipe left-to-right",    pipe(double, addOne)(3), 7);
test("Three fns compose",     compose(square, double, addOne)(2), 36);
test("Three fns pipe",        pipe(square, double, addOne)(2), 9);
test("Single fn",             compose(double)(5), 10);`},N=[{label:"JavaScript Fundamentals",tag:"JS",templates:[{name:"Hello World",code:`// Welcome to the Code Playground!
console.log("Hello, World!");
console.log("Start coding here...");`},{name:"Array Methods",code:`const fruits = ["apple", "banana", "cherry", "date", "elderberry"];

// map - transform each element
console.log("Uppercase:", fruits.map(f => f.toUpperCase()));

// filter - keep elements that match
console.log("Long names:", fruits.filter(f => f.length > 5));

// reduce - accumulate a result
console.log("Total chars:", fruits.reduce((sum, f) => sum + f.length, 0));

// find - get first match
console.log("First with 'a':", fruits.find(f => f.includes("a")));`},{name:"Closures",code:`function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.getCount());  // 11`},{name:"Promises & Async",code:`// Note: async results appear after sync code

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

console.log("Start");

delay(100, "First").then(v => console.log(v));
delay(50, "Second").then(v => console.log(v));

Promise.all([
  delay(10, "A"),
  delay(20, "B"),
  delay(5, "C"),
]).then(results => console.log("All:", results));

console.log("End (sync)");`},{name:"Map & Set",code:`// Map and Set are the modern alternatives to plain objects/arrays
// for keyed lookups and unique-value collections.

// ===== Map =====
// Like an object, but: any key type, preserves insertion order,
// has a size property, and is iterable directly.
const m = new Map();
m.set("name", "Ana");
m.set(42, "answer");          // numeric key — impossible with plain objects
m.set({ id: 1 }, "obj-key");  // even objects as keys

console.log("Map size:", m.size);                  // 3
console.log("Get name:", m.get("name"));           // "Ana"
console.log("Has 42:", m.has(42));                 // true

// Iteration: for...of gives [key, value] pairs
for (const [k, v] of m) console.log("  ", k, "->", v);

// ===== Set =====
// Unique values, any type. Common use: dedupe an array.
const nums = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(nums)];
console.log("Unique:", unique);                    // [1, 2, 3, 4]

const s = new Set();
s.add("a").add("b").add("a");                      // chainable
console.log("Set size:", s.size);                  // 2 ("a" not added twice)

// ===== When to use which =====
// Object  — fixed keys, JSON-friendly, simplest case
// Map     — many additions/removals, non-string keys, need .size
// Array   — ordered, indexed
// Set     — uniqueness checks, dedup`},{name:"Spread & Rest",code:`// Same syntax (...), opposite jobs:
//   spread  EXPANDS an iterable into individual elements
//   rest    COLLECTS individual arguments into an array

// ===== Spread — expand =====
const a = [1, 2, 3];
const b = [4, 5];

console.log([...a, ...b]);              // [1, 2, 3, 4, 5]   array concat
console.log(Math.max(...a));            // 3                 spread args

const obj1 = { x: 1, y: 2 };
const obj2 = { ...obj1, z: 3 };         // shallow merge
console.log(obj2);                      // { x: 1, y: 2, z: 3 }

// Important: shallow only — nested objects share references
const orig = { nested: { val: 1 } };
const copy = { ...orig };
copy.nested.val = 999;
console.log(orig.nested.val);           // 999  (mutated through shared ref!)

// ===== Rest — collect =====
function sum(...nums) {                 // collects args into an array
  return nums.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3, 4));           // 10

// Rest in destructuring
const [first, ...others] = [10, 20, 30, 40];
console.log(first, others);             // 10  [20, 30, 40]

const { name, ...rest } = { name: "Ana", age: 30, role: "dev" };
console.log(name);                      // "Ana"
console.log(rest);                      // { age: 30, role: "dev" }

// Common pitfall: rest must be last
// const [...all, last] = [1, 2, 3];   // SyntaxError`}]},{label:"JS Interview Topics",tag:"JS",templates:[{name:"Event Loop & Microtasks",code:`// Predict the output order!

console.log("1: sync");

setTimeout(() => console.log("2: setTimeout (macro)"), 0);

Promise.resolve().then(() => console.log("3: Promise (micro)"));

queueMicrotask(() => console.log("4: queueMicrotask (micro)"));

console.log("5: sync");

// Answer: 1, 5, 3, 4, 2
// Microtasks (Promise, queueMicrotask) run before macrotasks (setTimeout)`},{name:"this Keyword",code:`const obj = {
  name: "Alice",
  greet() {
    return \`Hi, I'm \${this.name}\`;
  },
  greetArrow: () => {
    return \`Hi, I'm \${typeof this?.name}\`;  // arrow inherits outer 'this'
  },
};

console.log("Method call:", obj.greet());         // "Alice"
console.log("Arrow call:", obj.greetArrow());     // "undefined"

// Lost context
const greet = obj.greet;
try {
  console.log("Detached:", greet());              // "undefined"
} catch(e) {
  console.log("Error:", e.message);
}

// Explicit binding
console.log("call():", greet.call({ name: "Bob" }));     // "Bob"
console.log("bind():", greet.bind({ name: "Eve" })());   // "Eve"`},{name:"Debounce & Throttle",code:`function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

// Demo: debounce — only last call fires
const debouncedLog = debounce((x) => console.log("debounced:", x), 200);
debouncedLog("a");
debouncedLog("b");
debouncedLog("c"); // only "c" fires after 200ms

// Demo: throttle — at most once per interval
const throttledLog = throttle((x) => console.log("throttled:", x), 100);
throttledLog("1");
throttledLog("2"); // skipped (too soon)

console.log("Check console after ~200ms for debounce result");`},{name:"Currying",code:`// Currying: transform f(a, b, c) into f(a)(b)(c)

const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

const add = curry((a, b, c) => a + b + c);

console.log(add(1)(2)(3));    // 6
console.log(add(1, 2)(3));    // 6
console.log(add(1)(2, 3));    // 6

// Practical use: create reusable functions
const multiply = curry((a, b) => a * b);
const double = multiply(2);
const triple = multiply(3);

console.log(double(5));   // 10
console.log(triple(5));   // 15
console.log([1,2,3,4].map(double)); // [2,4,6,8]`},{name:"Prototypes & Classes",code:`class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} makes a sound.\`;
  }
}

class Dog extends Animal {
  speak() {
    return \`\${this.name} barks!\`;
  }
}

const dog = new Dog("Rex");
console.log(dog.speak());
console.log(dog instanceof Animal);  // true
console.log(dog instanceof Dog);     // true

// Prototype chain
console.log(Object.getPrototypeOf(dog) === Dog.prototype);       // true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true`},{name:"Destructuring Deep Dive",code:`// Nested destructuring
const { data: { users: [first, ...rest] } } = {
  data: { users: ["Alice", "Bob", "Charlie"] }
};
console.log("First:", first, "Rest:", rest);

// Default values + rename
const { name: userName = "Anonymous", age = 0 } = { name: "Sree" };
console.log("Name:", userName, "Age:", age);

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log("Swapped:", a, b);

// Function parameter destructuring
function greet({ name, role = "developer" }) {
  console.log(\`Hello \${name}, you are a \${role}\`);
}
greet({ name: "Alice" });
greet({ name: "Bob", role: "designer" });

// Rest in objects
const { x, y, ...remaining } = { x: 1, y: 2, z: 3, w: 4 };
console.log("Remaining:", remaining);`},{name:"Tricky Interview Q",code:`// Classic interview gotchas

// 1. typeof null
console.log("typeof null:", typeof null);  // "object" (historic bug)

// 2. == vs ===
console.log("0 == '':", 0 == "");    // true (coercion)
console.log("0 === '':", 0 === "");  // false (strict)

// 3. NaN
console.log("NaN === NaN:", NaN === NaN);  // false!
console.log("Number.isNaN(NaN):", Number.isNaN(NaN)); // true

// 4. Array quirks
console.log("[] == []:", [] == []);     // false (different refs)
console.log("[1] + [2]:", [1] + [2]);   // "12" (string concat)

// 5. Hoisting
console.log("typeof undeclared:", typeof undeclaredVar); // "undefined" (no error)

// 6. Closure in loop
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var loop:", i), 10);
}
// Prints 3, 3, 3 (var is function-scoped)

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let loop:", j), 20);
}
// Prints 0, 1, 2 (let is block-scoped)`}]},{label:"React Basics",tag:"React",templates:[{name:"useState Counter",jsx:!0,code:`function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ textAlign: "center", padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ fontSize: 48, margin: 0 }}>{count}</h2>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
        <button onClick={() => setCount(c => c - 1)}>-1</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(c => c + 1)}>+1</button>
      </div>
    </div>
  );
}

render(<Counter />);`},{name:"useEffect Lifecycle",jsx:!0,code:`function Timer() {
  const [seconds, setSeconds] = React.useState(0);
  const [running, setRunning] = React.useState(true);

  React.useEffect(() => {
    if (!running) return;
    console.log("Effect: timer started");
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => {
      clearInterval(id);
      console.log("Cleanup: timer stopped");
    };
  }, [running]);

  return (
    <div style={{ textAlign: "center", padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ fontSize: 48, margin: 0 }}>⏱ {seconds}s</h2>
      <button onClick={() => setRunning(r => !r)} style={{ marginTop: 16 }}>
        {running ? "⏸ Pause" : "▶ Resume"}
      </button>
      <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>Check console for lifecycle logs</p>
    </div>
  );
}

render(<Timer />);`},{name:"Custom Hook",jsx:!0,code:`// Custom hook: useLocalStorage
function useLocalStorage(key, initial) {
  const [value, setValue] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [name, setName] = useLocalStorage("playground-demo-name", "");
  const [color, setColor] = useLocalStorage("playground-demo-color", "#6366f1");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Custom Hook: useLocalStorage</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Type your name..."
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          <span style={{ color }}>Favorite color</span>
        </div>
      </div>
      <p style={{ color: "#888", fontSize: 12, marginTop: 16 }}>
        Values persist in localStorage — try re-running!
      </p>
    </div>
  );
}

render(<App />);`}]},{label:"React Advanced",tag:"React",templates:[{name:"useReducer Todo",jsx:!0,code:`function todosReducer(state, action) {
  switch (action.type) {
    case "add":
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case "toggle":
      return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case "delete":
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = React.useReducer(todosReducer, []);
  const [text, setText] = React.useState("");

  const handleAdd = () => {
    if (text.trim()) {
      dispatch({ type: "add", text });
      setText("");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 400, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>useReducer Todo</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add todo..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {todos.map(t => (
          <li key={t.id} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
            textDecoration: t.done ? "line-through" : "none",
            opacity: t.done ? 0.5 : 1
          }}>
            <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: "toggle", id: t.id })} />
            <span style={{ flex: 1 }}>{t.text}</span>
            <button onClick={() => dispatch({ type: "delete", id: t.id })} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>✕</button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p style={{ color: "#999", textAlign: "center" }}>No todos yet</p>}
    </div>
  );
}

render(<TodoApp />);`},{name:"Context API",jsx:!0,code:`// Theme context — no prop drilling
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [dark, setDark] = React.useState(false);
  const theme = {
    bg: dark ? "#1a1a2e" : "#ffffff",
    text: dark ? "#e0e0e0" : "#1a1a1a",
    accent: dark ? "#6366f1" : "#4f46e5",
    toggle: () => setDark(d => !d),
    dark,
  };
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  return React.useContext(ThemeContext);
}

function Header() {
  const theme = useTheme();
  return (
    <div style={{ padding: 16, borderBottom: "1px solid " + (theme.dark ? "#333" : "#eee"), display: "flex", justifyContent: "space-between" }}>
      <strong style={{ color: theme.accent }}>Context Demo</strong>
      <button onClick={theme.toggle}>{theme.dark ? "☀️ Light" : "🌙 Dark"}</button>
    </div>
  );
}

function Content() {
  const theme = useTheme();
  return (
    <div style={{ padding: 16 }}>
      <p>Theme is: <strong>{theme.dark ? "Dark" : "Light"}</strong></p>
      <p style={{ color: "#888", fontSize: 13 }}>Header and Content both read from ThemeContext — no props passed!</p>
    </div>
  );
}

function App() {
  const theme = useTheme();
  return (
    <div style={{ background: theme.bg, color: theme.text, borderRadius: 12, overflow: "hidden", fontFamily: "system-ui", transition: "all 0.3s" }}>
      <Header />
      <Content />
    </div>
  );
}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);`},{name:"React Compiler Patterns",jsx:!0,code:`// React Compiler automatically memoizes computations
// that you'd manually wrap with useMemo/useCallback/React.memo.
//
// WITHOUT compiler:
//   const filtered = useMemo(() => items.filter(...), [items, query]);
//
// WITH compiler — just write plain code:

function ExpensiveList({ items, query }) {
  // Compiler auto-memoizes this computation
  const filtered = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  console.log("ExpensiveList rendered with", filtered.length, "items");

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {filtered.map((item, i) => (
        <li key={i} style={{ padding: "4px 0", borderBottom: "1px solid #eee" }}>{item}</li>
      ))}
      {filtered.length === 0 && <li style={{ color: "#999" }}>No matches</li>}
    </ul>
  );
}

function App() {
  const [query, setQuery] = React.useState("");
  const [count, setCount] = React.useState(0);

  // Compiler knows this array is stable
  const items = [
    "React", "Redux", "Router", "TanStack Query",
    "Next.js", "Remix", "Vite", "TypeScript",
    "Node.js", "Express", "MongoDB", "PostgreSQL",
  ];

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 400 }}>
      <h3 style={{ marginTop: 0 }}>React Compiler Demo</h3>
      <p style={{ color: "#888", fontSize: 13 }}>
        Compiler auto-memoizes the filtered list.
        Clicking "Count" won't re-filter. Check console!
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter technologies..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
      </div>
      <ExpensiveList items={items} query={query} />
    </div>
  );
}

render(<App />);`}]},{label:"JS Polyfills",tag:"JS",templates:[{name:"Array.map",code:`// Polyfill: Array.prototype.map
Array.prototype.myMap = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }
  return result;
};

// Test
const nums = [1, 2, 3, 4, 5];
console.log("Native map:", nums.map(n => n * 2));
console.log("Polyfill:  ", nums.myMap(n => n * 2));

// With index and array access
console.log("With index:", nums.myMap((val, idx) => \`\${idx}:\${val}\`));

// With thisArg
const multiplier = { factor: 10 };
console.log("thisArg:   ", nums.myMap(function(n) { return n * this.factor; }, multiplier));`},{name:"Array.filter",code:`// Polyfill: Array.prototype.filter
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// Test
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Native filter:", nums.filter(n => n % 2 === 0));
console.log("Polyfill:     ", nums.myFilter(n => n % 2 === 0));

// Filter with index
console.log("Even index:", nums.myFilter((_, i) => i % 2 === 0));

// Filter objects
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 30 },
];
console.log("Adults:", users.myFilter(u => u.age >= 18).myMap(u => u.name));`},{name:"Array.reduce",code:`// Polyfill: Array.prototype.reduce
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator;
  let startIndex;

  if (arguments.length >= 2) {
    accumulator = initialValue;
    startIndex = 0;
  } else {
    if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  return accumulator;
};

// Test: sum
const nums = [1, 2, 3, 4, 5];
console.log("Native sum:", nums.reduce((a, b) => a + b, 0));
console.log("Polyfill:  ", nums.myReduce((a, b) => a + b, 0));

// Without initial value
console.log("No init:   ", nums.myReduce((a, b) => a + b));

// Build an object
const fruits = ["apple", "banana", "apple", "cherry", "banana", "apple"];
const count = fruits.myReduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log("Frequency:", count);

// Flatten nested arrays
const nested = [[1, 2], [3, 4], [5]];
console.log("Flatten:", nested.myReduce((a, b) => a.concat(b), []));`},{name:"Array.forEach",code:`// Polyfill: Array.prototype.forEach
Array.prototype.myForEach = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      callback.call(thisArg, this[i], i, this);
    }
  }
};

// Test
const fruits = ["apple", "banana", "cherry"];

console.log("--- Native forEach ---");
fruits.forEach((fruit, i) => console.log(\`\${i}: \${fruit}\`));

console.log("--- Polyfill ---");
fruits.myForEach((fruit, i) => console.log(\`\${i}: \${fruit}\`));

// Key difference: forEach returns undefined, cannot break
const result = fruits.myForEach(f => f);
console.log("Return value:", result); // undefined`},{name:"Array.find & findIndex",code:`// Polyfill: Array.prototype.find
Array.prototype.myFind = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return this[i];
    }
  }
  return undefined;
};

// Polyfill: Array.prototype.findIndex
Array.prototype.myFindIndex = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return i;
    }
  }
  return -1;
};

// Test
const users = [
  { id: 1, name: "Alice", role: "admin" },
  { id: 2, name: "Bob", role: "user" },
  { id: 3, name: "Charlie", role: "user" },
];

console.log("find admin:", users.myFind(u => u.role === "admin"));
console.log("find index:", users.myFindIndex(u => u.name === "Charlie"));
console.log("not found: ", users.myFind(u => u.name === "Dave"));
console.log("not found: ", users.myFindIndex(u => u.name === "Dave")); // -1`},{name:"Array.some & every",code:`// Polyfill: Array.prototype.some
Array.prototype.mySome = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return true;
    }
  }
  return false;
};

// Polyfill: Array.prototype.every
Array.prototype.myEvery = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && !callback.call(thisArg, this[i], i, this)) {
      return false;
    }
  }
  return true;
};

// Test
const nums = [2, 4, 6, 8, 10];

console.log("some > 5:", nums.mySome(n => n > 5));    // true
console.log("some > 20:", nums.mySome(n => n > 20));   // false
console.log("every even:", nums.myEvery(n => n % 2 === 0)); // true
console.log("every > 5:", nums.myEvery(n => n > 5));   // false

// Practical: form validation
const fields = [
  { name: "email", valid: true },
  { name: "password", valid: true },
  { name: "age", valid: false },
];
console.log("All valid:", fields.myEvery(f => f.valid));
console.log("Any valid:", fields.mySome(f => f.valid));`},{name:"Array.flat & flatMap",code:`// Polyfill: Array.prototype.flat
Array.prototype.myFlat = function(depth = 1) {
  const result = [];
  const flatten = (arr, d) => {
    for (let i = 0; i < arr.length; i++) {
      if (i in arr) {
        if (Array.isArray(arr[i]) && d > 0) {
          flatten(arr[i], d - 1);
        } else {
          result.push(arr[i]);
        }
      }
    }
  };
  flatten(this, depth);
  return result;
};

// Polyfill: Array.prototype.flatMap
Array.prototype.myFlatMap = function(callback, thisArg) {
  return this.myMap(callback, thisArg).myFlat(1);
};

// Test flat
const nested = [1, [2, 3], [4, [5, 6]]];
console.log("flat(1):", nested.myFlat());
console.log("flat(2):", nested.myFlat(2));
console.log("flat(∞):", [1, [2, [3, [4, [5]]]]].myFlat(Infinity));

// Test flatMap
const sentences = ["Hello World", "Foo Bar"];
console.log("flatMap:", sentences.myFlatMap(s => s.split(" ")));

// Practical: expand data
const orders = [
  { id: 1, items: ["shirt", "hat"] },
  { id: 2, items: ["shoes"] },
];
console.log("All items:", orders.myFlatMap(o => o.items));`},{name:"Function.bind",code:`// Polyfill: Function.prototype.bind
Function.prototype.myBind = function(thisArg, ...boundArgs) {
  const fn = this;
  return function(...callArgs) {
    return fn.apply(thisArg, [...boundArgs, ...callArgs]);
  };
};

// Test: basic binding
const user = { name: "Alice" };
function greet(greeting, punctuation) {
  return \`\${greeting}, \${this.name}\${punctuation}\`;
}

const greetAlice = greet.myBind(user, "Hello");
console.log(greetAlice("!"));   // "Hello, Alice!"
console.log(greetAlice("?"));   // "Hello, Alice?"

// Test: partial application
function multiply(a, b) {
  return a * b;
}
const double = multiply.myBind(null, 2);
const triple = multiply.myBind(null, 3);
console.log("double(5):", double(5));  // 10
console.log("triple(5):", triple(5));  // 15

// Test: compare with native
const nativeBound = greet.bind(user, "Hi");
const polyBound = greet.myBind(user, "Hi");
console.log("Native:", nativeBound("."));
console.log("Poly:  ", polyBound("."));`},{name:"Function.call & apply",code:`// Polyfill: Function.prototype.call
Function.prototype.myCall = function(thisArg, ...args) {
  thisArg = thisArg ?? globalThis;
  thisArg = Object(thisArg);
  const sym = Symbol("fn");
  thisArg[sym] = this;
  const result = thisArg[sym](...args);
  delete thisArg[sym];
  return result;
};

// Polyfill: Function.prototype.apply
Function.prototype.myApply = function(thisArg, argsArray = []) {
  return this.myCall(thisArg, ...argsArray);
};

// Test
function introduce(greeting, age) {
  return \`\${greeting}, I'm \${this.name}, \${age} years old\`;
}

const person = { name: "Alice" };

console.log("Native call: ", introduce.call(person, "Hello", 25));
console.log("Polyfill call:", introduce.myCall(person, "Hello", 25));

console.log("Native apply: ", introduce.apply(person, ["Hi", 30]));
console.log("Polyfill apply:", introduce.myApply(person, ["Hi", 30]));

// Borrow methods
const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
const arr = Array.prototype.slice.myCall(arrayLike);
console.log("Array-like to array:", arr);

// Math.max with apply
const nums = [3, 1, 4, 1, 5, 9];
console.log("Max:", Math.max.myApply(null, nums));`},{name:"Promise.all",code:`// Polyfill: Promise.all
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = 0;

    const iterable = [...promises];
    if (iterable.length === 0) return resolve([]);

    iterable.forEach((p, i) => {
      remaining++;
      Promise.resolve(p).then(
        (value) => {
          results[i] = value;
          remaining--;
          if (remaining === 0) resolve(results);
        },
        reject  // reject on first failure
      );
    });
  });
};

// Test: all resolve
Promise.myAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(r => console.log("All resolved:", r)); // [1, 2, 3]

// Test: mixed values and promises
Promise.myAll([
  42,
  Promise.resolve("hello"),
  new Promise(r => setTimeout(() => r("delayed"), 50)),
]).then(r => console.log("Mixed:", r));

// Test: one rejects
Promise.myAll([
  Promise.resolve("ok"),
  Promise.reject("fail"),
  Promise.resolve("ok2"),
]).catch(e => console.log("Rejected:", e)); // "fail"

// Test: empty array
Promise.myAll([]).then(r => console.log("Empty:", r)); // []`},{name:"Promise.allSettled",code:`// Polyfill: Promise.allSettled
Promise.myAllSettled = function(promises) {
  return new Promise((resolve) => {
    const results = [];
    let remaining = 0;

    const iterable = [...promises];
    if (iterable.length === 0) return resolve([]);

    iterable.forEach((p, i) => {
      remaining++;
      Promise.resolve(p).then(
        (value) => {
          results[i] = { status: "fulfilled", value };
          if (--remaining === 0) resolve(results);
        },
        (reason) => {
          results[i] = { status: "rejected", reason };
          if (--remaining === 0) resolve(results);
        }
      );
    });
  });
};

// Test: mix of resolved and rejected
Promise.myAllSettled([
  Promise.resolve("success"),
  Promise.reject("error"),
  Promise.resolve(42),
]).then(results => {
  console.log("Results:");
  results.forEach((r, i) => {
    console.log(\`  [\${i}] \${r.status}: \${r.value ?? r.reason}\`);
  });
});

// Practical: fetch multiple APIs (some may fail)
const apis = [
  Promise.resolve({ users: 10 }),
  Promise.reject(new Error("503 Service Unavailable")),
  Promise.resolve({ posts: 25 }),
];
Promise.myAllSettled(apis).then(results => {
  const successes = results.filter(r => r.status === "fulfilled");
  const failures = results.filter(r => r.status === "rejected");
  console.log(\`\\n\${successes.length} succeeded, \${failures.length} failed\`);
});`},{name:"Promise.race & any",code:`// Polyfill: Promise.race
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      Promise.resolve(p).then(resolve, reject);
    }
  });
};

// Polyfill: Promise.any
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let remaining = 0;

    const iterable = [...promises];
    if (iterable.length === 0) {
      return reject(new AggregateError([], "All promises were rejected"));
    }

    iterable.forEach((p, i) => {
      remaining++;
      Promise.resolve(p).then(resolve, (err) => {
        errors[i] = err;
        if (--remaining === 0) {
          reject(new AggregateError(errors, "All promises were rejected"));
        }
      });
    });
  });
};

// Test: race — first to settle wins
Promise.myRace([
  new Promise(r => setTimeout(() => r("slow"), 100)),
  new Promise(r => setTimeout(() => r("fast"), 10)),
]).then(v => console.log("Race winner:", v));

// Test: any — first to fulfill wins (ignores rejections)
Promise.myAny([
  Promise.reject("err1"),
  new Promise(r => setTimeout(() => r("success"), 50)),
  Promise.reject("err2"),
]).then(v => console.log("Any winner:", v));

// Test: any — all reject
Promise.myAny([
  Promise.reject("a"),
  Promise.reject("b"),
]).catch(e => console.log("All rejected:", e.message));`},{name:"Array.includes",code:`// Polyfill for Array.prototype.includes
// Spec quirks vs indexOf:
//   includes uses SameValueZero — so NaN includes NaN === true
//   indexOf uses strict ===     — so [NaN].indexOf(NaN) === -1

Array.prototype.myIncludes = function (target, fromIndex = 0) {
  const len = this.length;
  let start = fromIndex < 0 ? Math.max(len + fromIndex, 0) : fromIndex;
  for (let i = start; i < len; i++) {
    if (this[i] === target) return true;
    if (Number.isNaN(this[i]) && Number.isNaN(target)) return true;   // SameValueZero
  }
  return false;
};

// Tests
console.log([1, 2, 3].myIncludes(2));           // true
console.log([1, 2, 3].myIncludes(4));           // false
console.log([1, 2, 3].myIncludes(2, 2));        // false (start at index 2)
console.log([1, 2, 3].myIncludes(3, -1));       // true (negative fromIndex)
console.log([NaN].myIncludes(NaN));             // true — the SameValueZero difference`},{name:"Object.assign",code:`// Polyfill for Object.assign
// Copies enumerable own properties from sources to target.
// Later sources OVERWRITE earlier ones for the same key.

Object.myAssign = function (target, ...sources) {
  if (target == null) throw new TypeError("Cannot convert undefined/null to object");
  const result = Object(target);
  for (const source of sources) {
    if (source == null) continue;          // null/undefined sources are skipped
    for (const key of Object.keys(source)) {
      result[key] = source[key];
    }
  }
  return result;
};

// Tests
const merged = Object.myAssign({}, { a: 1 }, { b: 2 }, { a: 99 });
console.log(merged);                                    // { a: 99, b: 2 }

// Mutates target — returns same reference
const target = { x: 1 };
const ret = Object.myAssign(target, { y: 2 });
console.log(ret === target);                            // true
console.log(target);                                    // { x: 1, y: 2 }

// Important — only OWN enumerable props (not prototype, not symbols by default in our version)
console.log(Object.myAssign({}, "hello"));              // { 0: 'h', 1: 'e', 2: 'l', 3: 'l', 4: 'o' }`},{name:"Array.from",code:`// Polyfill for Array.from
// Converts iterables and array-likes into real arrays.
// Optional mapFn applied during creation (more efficient than .map after).

Array.myFrom = function (input, mapFn, thisArg) {
  const result = [];

  // Iterable case (Set, Map, generators, strings, ...)
  if (input != null && typeof input[Symbol.iterator] === "function") {
    let i = 0;
    for (const item of input) {
      result.push(mapFn ? mapFn.call(thisArg, item, i) : item);
      i++;
    }
    return result;
  }

  // Array-like case ({ length: N, 0: ..., 1: ... })
  if (input != null && typeof input.length === "number") {
    for (let i = 0; i < input.length; i++) {
      result.push(mapFn ? mapFn.call(thisArg, input[i], i) : input[i]);
    }
    return result;
  }

  return result;
};

// Tests
console.log(Array.myFrom("abc"));                         // ['a', 'b', 'c']
console.log(Array.myFrom(new Set([1, 2, 2, 3])));         // [1, 2, 3]
console.log(Array.myFrom({ length: 3 }, (_, i) => i * 2)); // [0, 2, 4]
console.log(Array.myFrom([1, 2, 3], x => x * 10));        // [10, 20, 30]
console.log(Array.myFrom(new Map([["a", 1], ["b", 2]]))); // [['a', 1], ['b', 2]]`},{name:"Array.sort",code:`// Polyfill for Array.prototype.sort
// Implementation here = QuickSort (V8 used to use this; modern V8 uses TimSort).
// Default comparator converts to string and compares — that's why
// [1, 10, 2].sort() returns [1, 10, 2] (string order)!

Array.prototype.mySort = function (compareFn) {
  // Default: lexicographic (string) compare
  const cmp = compareFn || ((a, b) => String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

  // In-place QuickSort — sort returns the same array, mutated.
  const quickSort = (arr, low, high) => {
    if (low >= high) return;
    const pivot = arr[Math.floor((low + high) / 2)];
    let i = low, j = high;
    while (i <= j) {
      while (cmp(arr[i], pivot) < 0) i++;
      while (cmp(arr[j], pivot) > 0) j--;
      if (i <= j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++; j--;
      }
    }
    quickSort(arr, low, j);
    quickSort(arr, i, high);
  };

  quickSort(this, 0, this.length - 1);
  return this;
};

// Tests
console.log([3, 1, 2].mySort());                        // [1, 2, 3]
console.log([1, 10, 2, 11].mySort());                   // [1, 10, 11, 2] — string compare!
console.log([1, 10, 2, 11].mySort((a, b) => a - b));    // [1, 2, 10, 11] — numeric
console.log([1, 10, 2, 11].mySort((a, b) => b - a));    // [11, 10, 2, 1] — descending

// Sort objects by a key
const users = [{ age: 30 }, { age: 25 }, { age: 35 }];
users.mySort((a, b) => a.age - b.age);
console.log(users);                                      // [{age:25}, {age:30}, {age:35}]

// Stability note: this implementation is NOT stable.
// Native sort has been stable since ES2019.`},{name:"Array.indexOf / lastIndexOf",code:`// Polyfill for Array.prototype.indexOf and lastIndexOf
// Strict equality (===), so [NaN].indexOf(NaN) === -1.
// (Use .includes if you need NaN-aware search — see the includes polyfill.)

Array.prototype.myIndexOf = function (target, fromIndex = 0) {
  const len = this.length;
  let start = fromIndex < 0 ? Math.max(len + fromIndex, 0) : fromIndex;
  for (let i = start; i < len; i++) {
    if (this[i] === target) return i;
  }
  return -1;
};

Array.prototype.myLastIndexOf = function (target, fromIndex = this.length - 1) {
  const len = this.length;
  let start = fromIndex < 0 ? len + fromIndex : Math.min(fromIndex, len - 1);
  for (let i = start; i >= 0; i--) {
    if (this[i] === target) return i;
  }
  return -1;
};

// Tests
console.log([1, 2, 3, 2, 1].myIndexOf(2));         // 1   (first match)
console.log([1, 2, 3, 2, 1].myLastIndexOf(2));     // 3   (last match)
console.log([1, 2, 3].myIndexOf(99));              // -1  (not found)
console.log([1, 2, 3, 2, 1].myIndexOf(2, 2));      // 3   (start search at index 2)
console.log([1, 2, 3, 2, 1].myLastIndexOf(2, 2));  // 1   (search backwards from index 2)
console.log([1, 2, 3].myIndexOf(3, -1));           // 2   (negative fromIndex)
console.log([NaN].myIndexOf(NaN));                 // -1  — strict equality gotcha`},{name:"Array.reverse",code:`// Polyfill for Array.prototype.reverse
// Mutates in place. Two-pointer swap from outside inward.

Array.prototype.myReverse = function () {
  let left = 0, right = this.length - 1;
  while (left < right) {
    [this[left], this[right]] = [this[right], this[left]];
    left++;
    right--;
  }
  return this;
};

// Tests
console.log([1, 2, 3, 4, 5].myReverse());          // [5, 4, 3, 2, 1]
console.log([].myReverse());                       // []
console.log(["a"].myReverse());                    // ["a"]
console.log([1, 2].myReverse());                   // [2, 1]

// Mutation — original array changes
const arr = [1, 2, 3];
const reversed = arr.myReverse();
console.log(arr === reversed);                     // true — same reference
console.log(arr);                                  // [3, 2, 1]

// For NON-mutating, ES2023 has toReversed():
//   const sorted = arr.toReversed();   // returns a new array`},{name:"Array.slice",code:`// Polyfill for Array.prototype.slice
// Returns a SHALLOW copy of a portion. Does NOT mutate the source.
// Negative indices count from the end.

Array.prototype.mySlice = function (start = 0, end = this.length) {
  const len = this.length;
  const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  const to = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
  const result = [];
  for (let i = from; i < to; i++) {
    result.push(this[i]);
  }
  return result;
};

// Tests
const arr = [1, 2, 3, 4, 5];

console.log(arr.mySlice(1, 3));        // [2, 3]
console.log(arr.mySlice(2));           // [3, 4, 5]   (no end)
console.log(arr.mySlice());            // [1, 2, 3, 4, 5]   (full copy)
console.log(arr.mySlice(-2));          // [4, 5]      (last 2)
console.log(arr.mySlice(1, -1));       // [2, 3, 4]   (negative end)
console.log(arr.mySlice(10));          // []          (out of range)
console.log(arr === arr.mySlice());    // false — slice returns a new array

// SHALLOW — nested objects share references with the source
const nested = [{ x: 1 }, { x: 2 }];
const copy = nested.mySlice();
copy[0].x = 999;
console.log(nested[0].x);              // 999 — same object!`},{name:"Array.splice",code:`// Polyfill for Array.prototype.splice
// MUTATES the array. Three jobs in one method:
//   1. Remove items from start to start+deleteCount
//   2. Insert new items at that position
//   3. Return the removed items

Array.prototype.mySplice = function (start, deleteCount, ...items) {
  const len = this.length;
  const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  const removeCount = deleteCount === undefined
    ? len - from
    : Math.max(0, Math.min(deleteCount, len - from));

  // Capture removed items
  const removed = [];
  for (let i = 0; i < removeCount; i++) removed.push(this[from + i]);

  // Build the new tail with inserted items
  const tail = this.slice(from + removeCount);

  // Truncate to start position, then append items + tail
  this.length = from;
  for (const item of items) this.push(item);
  for (const item of tail) this.push(item);

  return removed;
};

// Tests
const arr1 = [1, 2, 3, 4, 5];
const removed1 = arr1.mySplice(1, 2);
console.log(arr1);                              // [1, 4, 5]
console.log(removed1);                          // [2, 3]

const arr2 = [1, 2, 3];
arr2.mySplice(1, 0, 'a', 'b');                  // insert without removing
console.log(arr2);                              // [1, 'a', 'b', 2, 3]

const arr3 = [1, 2, 3, 4, 5];
arr3.mySplice(1, 2, 'a', 'b', 'c');             // remove 2, insert 3
console.log(arr3);                              // [1, 'a', 'b', 'c', 4, 5]

const arr4 = [1, 2, 3];
arr4.mySplice(-1);                              // remove last
console.log(arr4);                              // [1, 2]`},{name:"Array.concat",code:`// Polyfill for Array.prototype.concat
// Returns a new array combining the receiver with arguments.
// Each argument: array → spread its elements; non-array → push as-is.
// Notably does NOT recurse — only one level of array spreading.

Array.prototype.myConcat = function (...args) {
  const result = [];
  // Push receiver elements
  for (const item of this) result.push(item);
  // Push each arg (or its elements if it's an array)
  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const item of arg) result.push(item);
    } else {
      result.push(arg);
    }
  }
  return result;
};

// Tests
console.log([1, 2].myConcat([3, 4]));                  // [1, 2, 3, 4]
console.log([1, 2].myConcat([3, 4], [5, 6]));          // [1, 2, 3, 4, 5, 6]
console.log([1, 2].myConcat(3, 4));                    // [1, 2, 3, 4]   non-array args
console.log([1, 2].myConcat([3], 4, [5, 6]));          // [1, 2, 3, 4, 5, 6]   mixed

// Only one level of flattening — nested arrays stay nested
console.log([1].myConcat([[2, 3], [4]]));              // [1, [2, 3], [4]]

// Returns a NEW array; does not mutate
const arr = [1, 2];
const concatenated = arr.myConcat([3]);
console.log(arr);                                       // [1, 2]   unchanged
console.log(concatenated);                              // [1, 2, 3]`},{name:"String.padStart / padEnd",code:`// Polyfill for String.prototype.padStart and padEnd
// Pads a string to a target length with a fill string (default: space).
// Returns the original if already at or above target length.

String.prototype.myPadStart = function (targetLength, padString = " ") {
  if (this.length >= targetLength) return String(this);
  if (padString === "") return String(this);
  let pad = "";
  const needed = targetLength - this.length;
  while (pad.length < needed) pad += padString;
  return pad.slice(0, needed) + this;
};

String.prototype.myPadEnd = function (targetLength, padString = " ") {
  if (this.length >= targetLength) return String(this);
  if (padString === "") return String(this);
  let pad = "";
  const needed = targetLength - this.length;
  while (pad.length < needed) pad += padString;
  return this + pad.slice(0, needed);
};

// Tests
console.log("5".myPadStart(3, "0"));            // "005"
console.log("5".myPadStart(3));                 // "  5"
console.log("hello".myPadStart(3));             // "hello"  (already long enough)
console.log("hi".myPadStart(8, "ab"));          // "abababhi"
console.log("hi".myPadStart(7, "ab"));          // "ababahi" (truncated to fit)

console.log("5".myPadEnd(3, "0"));              // "500"
console.log("hi".myPadEnd(6, "."));             // "hi...."

// Common use case: time formatting
console.log(\`\${"5".myPadStart(2, "0")}:\${"7".myPadStart(2, "0")}\`);  // "05:07"`},{name:"JSON.stringify",code:`// Polyfill for JSON.stringify
// Recursive serialization with type-specific formatting.
// (Simplified — does not handle indent / replacer / circular detection.)

JSON.myStringify = function (value) {
  if (value === null) return "null";
  if (value === undefined) return undefined;             // top-level undefined → undefined return

  const t = typeof value;
  if (t === "number") return Number.isFinite(value) ? String(value) : "null";   // NaN/Inf → null
  if (t === "boolean") return String(value);
  if (t === "string") return '"' + value.replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\\\"') + '"';
  if (t === "function" || t === "symbol") return undefined;                     // skipped

  if (Array.isArray(value)) {
    const items = value.map(v => {
      const serialized = JSON.myStringify(v);
      return serialized === undefined ? "null" : serialized;
    });
    return "[" + items.join(",") + "]";
  }

  if (t === "object") {
    // Use toJSON if defined (e.g., Date)
    if (typeof value.toJSON === "function") return JSON.myStringify(value.toJSON());

    const pairs = [];
    for (const key of Object.keys(value)) {
      const serialized = JSON.myStringify(value[key]);
      if (serialized !== undefined) {        // skip undefined / fn / symbol values
        pairs.push(JSON.myStringify(key) + ":" + serialized);
      }
    }
    return "{" + pairs.join(",") + "}";
  }

  return undefined;
};

// Tests
console.log(JSON.myStringify({ a: 1, b: "hi" }));            // {"a":1,"b":"hi"}
console.log(JSON.myStringify([1, 2, 3]));                    // [1,2,3]
console.log(JSON.myStringify({ x: null, y: undefined }));    // {"x":null}  — undefined dropped!
console.log(JSON.myStringify([1, undefined, 2]));            // [1,null,2]  — undefined → null
console.log(JSON.myStringify(NaN));                          // null        — NaN/Inf serialized as null
console.log(JSON.myStringify({ a: function () {} }));        // {}          — fn dropped
console.log(JSON.myStringify(new Date(0)));                  // "1970-01-01T00:00:00.000Z" via toJSON

// Compare to native
console.log(JSON.myStringify({ a: 1, b: [1, 2] }) === JSON.stringify({ a: 1, b: [1, 2] }));   // true`},{name:"Object.keys / values / entries",code:`// Polyfill for Object.keys, Object.values, Object.entries
// All three iterate ENUMERABLE OWN string-keyed properties.
// (Not symbols, not inherited, not non-enumerable.)

Object.myKeys = function (obj) {
  if (obj == null) throw new TypeError("Cannot convert null/undefined to object");
  const keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) keys.push(key);
  }
  return keys;
};

Object.myValues = function (obj) {
  return Object.myKeys(obj).map(k => obj[k]);
};

Object.myEntries = function (obj) {
  return Object.myKeys(obj).map(k => [k, obj[k]]);
};

// Tests
const user = { name: "Ana", age: 30, role: "dev" };

console.log(Object.myKeys(user));        // ["name", "age", "role"]
console.log(Object.myValues(user));      // ["Ana", 30, "dev"]
console.log(Object.myEntries(user));     // [["name", "Ana"], ["age", 30], ["role", "dev"]]

// Reconstruct an object from entries
const entries = Object.myEntries(user);
const restored = Object.fromEntries(entries);
console.log(restored);                    // { name: "Ana", age: 30, role: "dev" }

// Filter keys, then rebuild
const safe = Object.fromEntries(
  Object.myEntries(user).filter(([k]) => k !== "age")
);
console.log(safe);                        // { name: "Ana", role: "dev" }

// Inherited props are NOT included
const proto = { inherited: "yes" };
const child = Object.create(proto);
child.own = "yes";
console.log(Object.myKeys(child));        // ["own"]   — proto skipped`}]},{label:"Coding Challenges",tag:"JS",templates:[{name:"Two Sum",code:`// ===== CHALLENGE: Two Sum =====
// Given an array of integers and a target,
// return indices of the two numbers that add up to target.
//
// Example: twoSum([2, 7, 11, 15], 9) → [0, 1]
//
// Constraints:
// - Each input has exactly one solution
// - You may not use the same element twice

function twoSum(nums, target) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Example 1", twoSum([2, 7, 11, 15], 9), [0, 1]);
test("Example 2", twoSum([3, 2, 4], 6), [1, 2]);
test("Example 3", twoSum([3, 3], 6), [0, 1]);`},{name:"Reverse String",code:`// ===== CHALLENGE: Reverse String =====
// Reverse a string without using the built-in reverse() method.
//
// Example: reverseString("hello") → "olleh"
// Example: reverseString("world") → "dlrow"
//
// Constraints:
// - Do not use Array.prototype.reverse()
// - Try to do it in place (treat string as char array)

function reverseString(str) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple word", reverseString("hello"), "olleh");
test("Another word", reverseString("world"), "dlrow");
test("Single char", reverseString("a"), "a");
test("Empty string", reverseString(""), "");
test("Palindrome", reverseString("racecar"), "racecar");`},{name:"Valid Palindrome",code:`// ===== CHALLENGE: Valid Palindrome =====
// Check if a string is a palindrome, considering only
// alphanumeric characters and ignoring case.
//
// Example: isPalindrome("A man, a plan, a canal: Panama") → true
// Example: isPalindrome("race a car") → false
//
// Constraints:
// - Ignore non-alphanumeric characters
// - Case insensitive comparison

function isPalindrome(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Classic palindrome", isPalindrome("A man, a plan, a canal: Panama"), true);
test("Not a palindrome", isPalindrome("race a car"), false);
test("Empty string", isPalindrome(""), true);
test("Single char", isPalindrome("a"), true);
test("With numbers", isPalindrome("0P"), false);`},{name:"FizzBuzz",code:`// ===== CHALLENGE: FizzBuzz =====
// Return an array of strings from 1 to n where:
// - Multiples of 3 are replaced with "Fizz"
// - Multiples of 5 are replaced with "Buzz"
// - Multiples of both 3 and 5 are replaced with "FizzBuzz"
// - Other numbers are converted to strings
//
// Example: fizzBuzz(5) → ["1", "2", "Fizz", "4", "Buzz"]
//
// Constraints:
// - Return array of strings, not print them

function fizzBuzz(n) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("First 5", fizzBuzz(5), ["1", "2", "Fizz", "4", "Buzz"]);
test("First 15", fizzBuzz(15), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]);
test("Just 1", fizzBuzz(1), ["1"]);
test("FizzBuzz at 30", fizzBuzz(30).slice(-1), ["FizzBuzz"]);`},{name:"Max Profit",code:`// ===== CHALLENGE: Max Profit (Best Time to Buy & Sell Stock) =====
// Given an array of prices where prices[i] is the price on day i,
// find the maximum profit from one transaction (buy then sell).
// If no profit is possible, return 0.
//
// Example: maxProfit([7, 1, 5, 3, 6, 4]) → 5  (buy at 1, sell at 6)
// Example: maxProfit([7, 6, 4, 3, 1]) → 0  (prices only decrease)
//
// Constraints:
// - You must buy before you sell
// - Only one transaction allowed

function maxProfit(prices) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Normal case", maxProfit([7, 1, 5, 3, 6, 4]), 5);
test("Decreasing prices", maxProfit([7, 6, 4, 3, 1]), 0);
test("Single day", maxProfit([5]), 0);
test("Two days profit", maxProfit([1, 2]), 1);
test("Buy first sell last", maxProfit([1, 4, 2, 7]), 6);`},{name:"Valid Parentheses",code:`// ===== CHALLENGE: Valid Parentheses =====
// Given a string containing just '(', ')', '{', '}', '[' and ']',
// determine if the input string is valid.
//
// A string is valid if:
// - Open brackets are closed by the same type
// - Open brackets are closed in the correct order
//
// Example: isValid("()[]{}") → true
// Example: isValid("(]") → false
//
// Constraints:
// - String contains only bracket characters

function isValid(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple pair", isValid("()"), true);
test("Multiple types", isValid("()[]{}"), true);
test("Mismatched", isValid("(]"), false);
test("Nested valid", isValid("{[()]}"), true);
test("Wrong order", isValid("([)]"), false);
test("Empty string", isValid(""), true);`},{name:"Merge Sorted Arrays",code:`// ===== CHALLENGE: Merge Sorted Arrays =====
// Given two sorted arrays, merge them into one sorted array.
//
// Example: mergeSorted([1, 3, 5], [2, 4, 6]) → [1, 2, 3, 4, 5, 6]
//
// Constraints:
// - Both input arrays are already sorted in ascending order
// - Do not simply concatenate and sort
// - Aim for O(n + m) time complexity

function mergeSorted(arr1, arr2) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Equal length", mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
test("Different lengths", mergeSorted([1, 2], [3, 4, 5, 6]), [1, 2, 3, 4, 5, 6]);
test("One empty", mergeSorted([], [1, 2, 3]), [1, 2, 3]);
test("Both empty", mergeSorted([], []), []);
test("With duplicates", mergeSorted([1, 3, 3], [2, 3, 4]), [1, 2, 3, 3, 3, 4]);`},{name:"Flatten Array",code:`// ===== CHALLENGE: Flatten Array =====
// Flatten a deeply nested array without using Array.prototype.flat().
//
// Example: flatten([1, [2, [3, [4]], 5]]) → [1, 2, 3, 4, 5]
//
// Constraints:
// - Do not use .flat() or .flatMap()
// - Handle arbitrary nesting depth
// - Return a new array (don't modify the original)

function flatten(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Nested", flatten([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5]);
test("Already flat", flatten([1, 2, 3]), [1, 2, 3]);
test("Deep nesting", flatten([[[[1]]]]), [1]);
test("Mixed", flatten([1, [2, 3], [4, [5, 6]]]), [1, 2, 3, 4, 5, 6]);
test("Empty arrays", flatten([[], [1], [], [2, []], 3]), [1, 2, 3]);`},{name:"Debounce",code:`// ===== CHALLENGE: Debounce =====
// Implement a debounce function that delays invoking the provided
// function until after 'delay' milliseconds have elapsed since
// the last time it was invoked.
//
// Example:
//   const debouncedFn = debounce(fn, 300);
//   debouncedFn(); // starts timer
//   debouncedFn(); // resets timer
//   // fn is called once, 300ms after the last call
//
// Constraints:
// - Returns a new function
// - Resets the timer on each call
// - Passes arguments to the original function

function debounce(fn, delay) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
let callCount = 0;
let lastArgs = null;
const trackedFn = (...args) => { callCount++; lastArgs = args; };

const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

// Test: multiple rapid calls only trigger once
callCount = 0;
const debounced = debounce(trackedFn, 100);
debounced("a");
debounced("b");
debounced("c");

test("Not called immediately", callCount, 0);

setTimeout(() => {
  test("Called once after delay", callCount, 1);
  test("Called with last args", lastArgs, ["c"]);
}, 150);

// Test: separate calls with enough gap
let count2 = 0;
const debounced2 = debounce(() => count2++, 50);
debounced2();
setTimeout(() => {
  debounced2();
  setTimeout(() => {
    test("Two separate calls", count2, 2);
  }, 80);
}, 80);`},{name:"Group Anagrams",code:`// ===== CHALLENGE: Group Anagrams =====
// Given an array of strings, group the anagrams together.
// An anagram is a word formed by rearranging the letters of another.
//
// Example: groupAnagrams(["eat","tea","tan","ate","nat","bat"])
//   → [["eat","tea","ate"], ["tan","nat"], ["bat"]]
//
// Constraints:
// - Order of groups doesn't matter
// - Order within groups doesn't matter
// - All inputs are lowercase letters

function groupAnagrams(strs) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  // Sort inner arrays and outer array for comparison
  const normalize = (arr) =>
    arr.map(g => [...g].sort()).sort((a, b) => a.join(",").localeCompare(b.join(",")));
  const pass = JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed anagrams", groupAnagrams(["eat","tea","tan","ate","nat","bat"]), [["eat","tea","ate"],["tan","nat"],["bat"]]);
test("Single string", groupAnagrams(["a"]), [["a"]]);
test("Empty string", groupAnagrams([""]), [[""]]);
test("No anagrams", groupAnagrams(["abc","def","ghi"]), [["abc"],["def"],["ghi"]]);`},{name:"Find Duplicates",code:`// ===== CHALLENGE: Find Duplicates =====
// Return an array of all duplicate values in the input array.
// A duplicate appears more than once.
//
// Example: findDuplicates([1, 2, 3, 2, 4, 3, 5]) → [2, 3]
// Example: findDuplicates(["a", "b", "a", "c"]) → ["a"]
//
// Constraints:
// - Each duplicate should appear once in the result
// - Order of result doesn't matter (tests sort before comparing)
// - Aim for O(n) time, O(n) space using a hash map

function findDuplicates(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const sortIfArr = (a) => Array.isArray(a) ? [...a].sort() : a;
  const pass = JSON.stringify(sortIfArr(actual)) === JSON.stringify(sortIfArr(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Numbers", findDuplicates([1, 2, 3, 2, 4, 3, 5]), [2, 3]);
test("Strings", findDuplicates(["a", "b", "a", "c"]), ["a"]);
test("No duplicates", findDuplicates([1, 2, 3, 4]), []);
test("All same", findDuplicates([7, 7, 7]), [7]);
test("Triple duplicate", findDuplicates([1, 1, 1, 2, 2]), [1, 2]);`},{name:"Remove Duplicates",code:`// ===== CHALLENGE: Remove Duplicates =====
// Remove duplicate values from an array, preserving original order.
// Implement WITHOUT using Set or filter+indexOf (do it manually).
//
// Example: removeDuplicates([1, 2, 1, 3, 2, 4]) → [1, 2, 3, 4]
//
// Constraints:
// - Preserve first-seen order
// - Do NOT use new Set() or [...new Set(arr)]
// - Aim for O(n) time using a hash map

function removeDuplicates(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Numbers", removeDuplicates([1, 2, 1, 3, 2, 4]), [1, 2, 3, 4]);
test("Strings", removeDuplicates(["a", "b", "a", "c", "b"]), ["a", "b", "c"]);
test("Already unique", removeDuplicates([1, 2, 3]), [1, 2, 3]);
test("All same", removeDuplicates([5, 5, 5, 5]), [5]);
test("Empty", removeDuplicates([]), []);`},{name:"Find Missing Number",code:`// ===== CHALLENGE: Find Missing Number =====
// An array contains n distinct numbers from the range [0, n].
// Find the one number that is missing.
//
// Example: findMissing([3, 0, 1]) → 2  (range is 0..3, missing 2)
// Example: findMissing([0, 1, 3]) → 2  (range is 0..3, missing 2)
//
// Constraints:
// - Numbers are distinct, in [0, n], one is missing
// - O(n) time, O(1) space — use the sum trick: n*(n+1)/2 - sum(arr)

function findMissing(nums) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Missing 2", findMissing([3, 0, 1]), 2);
test("Missing last", findMissing([0, 1]), 2);
test("Missing first", findMissing([1, 2]), 0);
test("Single missing 0", findMissing([1]), 0);
test("Larger array", findMissing([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);`},{name:"Move Zeros",code:`// ===== CHALLENGE: Move Zeros to End =====
// Move all zeros to the end of the array, keeping non-zero
// elements in their original order. Modify in-place if you can.
//
// Example: moveZeros([0, 1, 0, 3, 12]) → [1, 3, 12, 0, 0]
//
// Constraints:
// - Preserve relative order of non-zero elements
// - Try to do it with a two-pointer approach: O(n) time, O(1) space

function moveZeros(nums) {
  // YOUR CODE HERE

  return nums;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed", moveZeros([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
test("All zeros", moveZeros([0, 0, 0]), [0, 0, 0]);
test("No zeros", moveZeros([1, 2, 3]), [1, 2, 3]);
test("Single zero", moveZeros([0]), [0]);
test("Zeros first", moveZeros([0, 0, 1, 2]), [1, 2, 0, 0]);`},{name:"Rotate Array",code:`// ===== CHALLENGE: Rotate Array =====
// Rotate the array to the right by k steps.
// k may be larger than the array length — rotate by k % n.
//
// Example: rotate([1, 2, 3, 4, 5], 2) → [4, 5, 1, 2, 3]
// Example: rotate([1, 2], 5)          → [2, 1]    (5 % 2 = 1)
//
// Constraints:
// - Return the rotated array (don't print it)
// - Pure (don't mutate input) — return a new array
// - Try the slice + concat approach OR the reverse-three-times trick

function rotate(nums, k) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Rotate by 2", rotate([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]);
test("k > length",  rotate([1, 2], 5), [2, 1]);
test("k = 0",        rotate([1, 2, 3], 0), [1, 2, 3]);
test("k = length",   rotate([1, 2, 3], 3), [1, 2, 3]);
test("Single",       rotate([1], 5), [1]);`},{name:"Bubble Sort",code:`// ===== CHALLENGE: Bubble Sort (Custom Sort, No Built-In) =====
// Sort an array of numbers ascending WITHOUT using
// Array.prototype.sort or any built-in sort.
//
// Example: bubbleSort([5, 1, 4, 2, 8]) → [1, 2, 4, 5, 8]
//
// Bubble Sort: repeatedly swap adjacent out-of-order pairs.
// Time: O(n²) worst/average, O(n) best with early-exit.
// Space: O(1) — sorts in place.

function bubbleSort(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",       bubbleSort([5, 1, 4, 2, 8]), [1, 2, 4, 5, 8]);
test("Reversed",    bubbleSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",      bubbleSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("With duplicates", bubbleSort([3, 1, 2, 3, 1]), [1, 1, 2, 3, 3]);
test("Empty",       bubbleSort([]), []);`},{name:"Quick Sort",code:`// ===== CHALLENGE: Quick Sort =====
// Sort using the Quick Sort algorithm. Pick a pivot, partition
// into less-than and greater-than-pivot, recursively sort each.
//
// Example: quickSort([3, 6, 1, 4, 8, 2]) → [1, 2, 3, 4, 6, 8]
//
// Average: O(n log n). Worst: O(n²) on already-sorted input
// with naive pivot. Use middle/random pivot to avoid the worst case.

function quickSort(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",      quickSort([3, 6, 1, 4, 8, 2]), [1, 2, 3, 4, 6, 8]);
test("Reversed",   quickSort([9, 7, 5, 3, 1]), [1, 3, 5, 7, 9]);
test("Sorted",     quickSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("Single",     quickSort([42]), [42]);
test("Duplicates", quickSort([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3]);`},{name:"Merge Sort",code:`// ===== CHALLENGE: Merge Sort =====
// Sort using the Merge Sort algorithm. Recursively split the
// array in half, sort each half, then merge sorted halves.
//
// Example: mergeSort([5, 2, 8, 1, 9, 3]) → [1, 2, 3, 5, 8, 9]
//
// Time: O(n log n) — guaranteed, even on worst case.
// Space: O(n) — needs auxiliary arrays for merging.
// Stable: yes (preserves order of equal elements).

function mergeSort(arr) {
  // YOUR CODE HERE — split, recurse, merge

}

function merge(left, right) {
  // YOUR CODE HERE — combine two sorted arrays into one

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",     mergeSort([5, 2, 8, 1, 9, 3]), [1, 2, 3, 5, 8, 9]);
test("Reversed",  mergeSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",    mergeSort([1, 2, 3]), [1, 2, 3]);
test("Empty",     mergeSort([]), []);
test("Big",       mergeSort([10, -5, 7, 0, 3, 7]), [-5, 0, 3, 7, 7, 10]);`},{name:"Anagram Check",code:`// ===== CHALLENGE: Anagram Check =====
// Determine if two strings are anagrams of each other.
// Anagrams contain exactly the same letters in different order.
//
// Example: isAnagram("listen", "silent") → true
// Example: isAnagram("hello", "world")   → false
//
// Constraints:
// - Case-insensitive
// - Ignore spaces
// - O(n) time using a frequency map (NOT sort+compare)

function isAnagram(s1, s2) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Classic anagram",   isAnagram("listen", "silent"), true);
test("Not anagram",       isAnagram("hello", "world"),  false);
test("Different lengths", isAnagram("abc", "abcd"),     false);
test("Case insensitive",  isAnagram("Astronomer", "Moon starer"), true);
test("Empty strings",     isAnagram("", ""),             true);`},{name:"Longest Substring",code:`// ===== CHALLENGE: Longest Substring Without Repeating =====
// Given a string, find the length of the longest substring
// without repeating characters.
//
// Example: lengthOfLongestSubstring("abcabcbb") → 3  ("abc")
// Example: lengthOfLongestSubstring("bbbbb")    → 1  ("b")
// Example: lengthOfLongestSubstring("pwwkew")   → 3  ("wke")
//
// Constraints:
// - Use the sliding window pattern with a Map/Set
// - O(n) time, O(min(n, charset)) space

function lengthOfLongestSubstring(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("abcabcbb", lengthOfLongestSubstring("abcabcbb"), 3);
test("bbbbb",    lengthOfLongestSubstring("bbbbb"), 1);
test("pwwkew",   lengthOfLongestSubstring("pwwkew"), 3);
test("Empty",    lengthOfLongestSubstring(""), 0);
test("Unique",   lengthOfLongestSubstring("abcdef"), 6);`},{name:"First Non-Repeating Char",code:`// ===== CHALLENGE: First Non-Repeating Character =====
// Return the first character in a string that does NOT repeat,
// or null if every character repeats.
//
// Example: firstNonRepeating("leetcode")     → "l"
// Example: firstNonRepeating("loveleetcode") → "v"
// Example: firstNonRepeating("aabb")         → null
//
// Constraints:
// - Two-pass: count then scan, OR one-pass with order-preserving map

function firstNonRepeating(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("leetcode",     firstNonRepeating("leetcode"), "l");
test("loveleetcode", firstNonRepeating("loveleetcode"), "v");
test("All repeat",   firstNonRepeating("aabb"), null);
test("Single char",  firstNonRepeating("z"), "z");
test("Empty",        firstNonRepeating(""), null);`},{name:"Sum Curry",code:`// ===== CHALLENGE: Sum Curry — sum(1)(2)(3)... =====
// Implement an infinitely curryable sum function.
// Calling it without arguments (or coercing to number) returns the total.
//
// Example: sum(1)(2)(3)()       → 6
// Example: sum(1)(2)(3)(4)(5)() → 15
//
// Constraints:
// - Must work with any number of curried calls
// - Final empty () returns the accumulated sum
// - Hint: return a function that captures the running total in closure

function sum(a) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Two args",     sum(1)(2)(),          3);
test("Three args",   sum(1)(2)(3)(),       6);
test("Five args",    sum(1)(2)(3)(4)(5)(), 15);
test("Single arg",   sum(42)(),            42);
test("With zero",    sum(0)(0)(5)(),       5);`},{name:"Memoize",code:`// ===== CHALLENGE: Memoize =====
// Implement a higher-order function that caches results of
// expensive function calls. Subsequent calls with the same
// arguments return the cached result.
//
// Example:
//   const slowAdd = (a, b) => { /* heavy work */ return a + b; };
//   const fastAdd = memoize(slowAdd);
//   fastAdd(1, 2);  // computes, returns 3
//   fastAdd(1, 2);  // cached, returns 3 instantly
//
// Constraints:
// - Cache key must distinguish different argument sets
// - JSON.stringify(args) is the simplest key strategy

function memoize(fn) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
let computeCount = 0;
const slowDouble = (n) => { computeCount++; return n * 2; };
const fastDouble = memoize(slowDouble);

console.log(fastDouble(5));   // 10  (computed)
console.log(fastDouble(5));   // 10  (cached)
console.log(fastDouble(7));   // 14  (computed)
console.log(fastDouble(5));   // 10  (cached)

console.log(computeCount === 2 ? "✅" : "❌", "Cache hit count: expected 2 computes, got", computeCount);`},{name:"Deep Clone",code:`// ===== CHALLENGE: Deep Clone =====
// Implement a deep clone function for plain JS objects/arrays.
// Modifying the clone must NOT affect the original.
//
// Example:
//   const obj = { a: { b: { c: 1 } } };
//   const copy = deepClone(obj);
//   copy.a.b.c = 999;
//   obj.a.b.c === 1  (unchanged)
//
// Constraints:
// - Handle plain objects, arrays, primitives
// - Bonus: handle Date, RegExp
// - Do NOT use structuredClone() or JSON.parse(JSON.stringify())

function deepClone(value) {
  // YOUR CODE HERE

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
test("Different reference", original === cloned, false);`},{name:"Throttle",code:`// ===== CHALLENGE: Throttle =====
// Throttle ensures a function is called AT MOST once every \`limit\` ms.
// (Compare to Debounce: debounce delays until pause; throttle caps rate.)
//
// Use case: scroll/resize handlers — fire every 100ms, not 60 times/second.
//
// Example:
//   const onScroll = throttle(() => console.log("fire"), 100);
//   // 10 calls in 50ms => fires once at t=0
//   // call at t=110 => fires
//
// Constraints:
// - First call should fire immediately
// - Subsequent calls within the window should be ignored

function throttle(fn, limit) {
  // YOUR CODE HERE

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
}, 150);`},{name:"EventEmitter",code:`// ===== CHALLENGE: EventEmitter =====
// Implement a basic event emitter (pub/sub).
//
//   on(event, fn)    — register a listener
//   off(event, fn)   — remove that listener
//   emit(event, ...args) — call all listeners for event
//   once(event, fn)  — fire fn at most once
//
// Example:
//   const ee = new EventEmitter();
//   ee.on("data", (x) => console.log("got", x));
//   ee.emit("data", 42);  // got 42

class EventEmitter {
  constructor() {
    // YOUR CODE HERE
  }

  on(event, fn) {
    // YOUR CODE HERE
  }

  off(event, fn) {
    // YOUR CODE HERE
  }

  emit(event, ...args) {
    // YOUR CODE HERE
  }

  once(event, fn) {
    // YOUR CODE HERE
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
ee.emit("evt", 3);  // no longer registered

console.log(JSON.stringify(calls) === "[1,2]" ? "✅" : "❌", "on/off/emit:", calls);

let onceCount = 0;
ee.once("solo", () => onceCount++);
ee.emit("solo");
ee.emit("solo");
ee.emit("solo");

console.log(onceCount === 1 ? "✅" : "❌", \`once should fire 1x, fired \${onceCount}x\`);`},{name:"LRU Cache",code:`// ===== CHALLENGE: LRU Cache =====
// Least-Recently-Used cache with capacity \`n\`.
//   get(key)      — return value or -1, mark as most-recently-used
//   put(key, val) — insert/update, evict LRU if full
//
// Both operations should be O(1).
// Hint: JavaScript Map preserves insertion order — that's the trick.

class LRUCache {
  constructor(capacity) {
    // YOUR CODE HERE
  }

  get(key) {
    // YOUR CODE HERE
  }

  put(key, value) {
    // YOUR CODE HERE
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
console.log(cache.get(4));    // "d"`},{name:"Compose & Pipe",code:`// ===== CHALLENGE: Compose & Pipe =====
// Functional composition.
//   compose(f, g, h)(x) = f(g(h(x)))   — right to left
//   pipe(f, g, h)(x)    = h(g(f(x)))   — left to right
//
// Used in libraries like Redux (compose) and RxJS (pipe).

function compose(...fns) {
  // YOUR CODE HERE

}

function pipe(...fns) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

const double = (x) => x * 2;
const addOne = (x) => x + 1;
const square = (x) => x * x;

test("compose right-to-left", compose(double, addOne)(3), 8);     // (3+1)*2 = 8
test("pipe left-to-right",    pipe(double, addOne)(3), 7);        // 3*2+1 = 7
test("Three fns compose",     compose(square, double, addOne)(2), 36); // ((2+1)*2)² = 36
test("Three fns pipe",        pipe(square, double, addOne)(2), 9); // 2²*2+1 = 9
test("Single fn",             compose(double)(5), 10);`},{name:"Binary Search",code:`// ===== CHALLENGE: Binary Search =====
// Given a SORTED array and a target, return the index of the target
// or -1 if not found. O(log n).
//
// Example: binarySearch([-1, 0, 3, 5, 9, 12], 9) → 4
// Example: binarySearch([-1, 0, 3, 5, 9, 12], 2) → -1

function binarySearch(nums, target) {
  // YOUR CODE HERE — left/right pointers, narrow the range each step

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Found in middle",  binarySearch([-1, 0, 3, 5, 9, 12], 9), 4);
test("Not found",        binarySearch([-1, 0, 3, 5, 9, 12], 2), -1);
test("First element",    binarySearch([1, 2, 3, 4, 5], 1), 0);
test("Last element",     binarySearch([1, 2, 3, 4, 5], 5), 4);
test("Empty array",      binarySearch([], 5), -1);
test("Single element",   binarySearch([42], 42), 0);`},{name:"Roman to Integer",code:`// ===== CHALLENGE: Roman to Integer =====
// Convert a Roman numeral to an integer.
// Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000
// Subtraction rules: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900
//
// Example: romanToInt("III")    → 3
// Example: romanToInt("LVIII")  → 58
// Example: romanToInt("MCMXCIV") → 1994

function romanToInt(s) {
  // YOUR CODE HERE
  // Hint: if current symbol < next symbol, subtract; else add

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("III",     romanToInt("III"),     3);
test("LVIII",   romanToInt("LVIII"),   58);
test("MCMXCIV", romanToInt("MCMXCIV"), 1994);
test("IV",      romanToInt("IV"),      4);
test("XL",      romanToInt("XL"),      40);`},{name:"Reverse Linked List",code:`// ===== CHALLENGE: Reverse Linked List =====
// Reverse a singly linked list. Each node = { val, next }.
// Return the new head.
//
// Example: 1 -> 2 -> 3 -> null   becomes   3 -> 2 -> 1 -> null
//
// Constraints:
// - O(n) time, O(1) space iterative is the canonical answer
// - Recursive is also valid

function reverseList(head) {
  // YOUR CODE HERE — three pointers: prev, curr, next

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
test("Long list",   toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);`},{name:"Container With Most Water",code:`// ===== CHALLENGE: Container With Most Water =====
// Given an array of heights, find two lines that together with
// the x-axis form a container holding the most water.
// Return the maximum amount of water it can store.
//
// Example: maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]) → 49
//
// Constraints:
// - Two-pointer approach: O(n) time, O(1) space
// - Move the pointer with the smaller height inward each step

function maxArea(heights) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Standard",  maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
test("Two bars",  maxArea([1, 1]),                       1);
test("Same",      maxArea([4, 4, 4, 4]),                 12);
test("Increasing", maxArea([1, 2, 3, 4, 5]),             6);
test("Single",    maxArea([5]),                          0);`},{name:"Climbing Stairs",code:`// ===== CHALLENGE: Climbing Stairs =====
// You're climbing a staircase with n steps. Each move you can take
// either 1 step or 2 steps. How many distinct ways can you reach
// the top?
//
// Example: climbStairs(2) → 2  (1+1, or 2)
// Example: climbStairs(3) → 3  (1+1+1, 1+2, 2+1)
// Example: climbStairs(4) → 5
//
// Recognize the pattern: it's Fibonacci!
// f(n) = f(n-1) + f(n-2)
//
// Constraints:
// - O(n) time, O(1) space — track only the last two values

function climbStairs(n) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("n = 1",  climbStairs(1), 1);
test("n = 2",  climbStairs(2), 2);
test("n = 3",  climbStairs(3), 3);
test("n = 4",  climbStairs(4), 5);
test("n = 5",  climbStairs(5), 8);
test("n = 10", climbStairs(10), 89);`}]},{label:"React Machine Coding",tag:"React",templates:[{name:"Pagination",jsx:!0,code:`// ===== MACHINE CODING: Pagination Component =====
// Build a paginated list that fetches data from a simulated API.
// - Display items for the current page
// - Show page navigation (prev/next + page numbers)
// - Handle loading state
// - Highlight the active page

// Simulated API
const ALL_ITEMS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: \`Item #\${i + 1}\`,
  desc: \`Description for item \${i + 1}\`,
}));

function fakeFetch(page, perPage = 5) {
  return new Promise(resolve =>
    setTimeout(() => resolve({
      data: ALL_ITEMS.slice((page - 1) * perPage, page * perPage),
      total: ALL_ITEMS.length,
    }), 300)
  );
}

function Pagination() {
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const perPage = 5;

  React.useEffect(() => {
    setLoading(true);
    fakeFetch(page, perPage).then(res => {
      setItems(res.data);
      setTotalPages(Math.ceil(res.total / perPage));
      setLoading(false);
    });
  }, [page]);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 420 }}>
      <h3 style={{ marginTop: 0 }}>Paginated List</h3>
      {loading ? (
        <p style={{ color: "#888" }}>Loading...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map(item => (
            <li key={item.id} style={{
              padding: "10px 12px", marginBottom: 6, background: "#f5f5f5",
              borderRadius: 8, border: "1px solid #e0e0e0"
            }}>
              <strong>{item.title}</strong>
              <div style={{ fontSize: 13, color: "#666" }}>{item.desc}</div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 4, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", cursor: page === 1 ? "default" : "pointer" }}>
          Prev
        </button>
        {pageNums.map(n => (
          <button key={n} onClick={() => setPage(n)}
            style={{
              padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc",
              background: n === page ? "#4f46e5" : "#fff",
              color: n === page ? "#fff" : "#333",
              fontWeight: n === page ? 700 : 400, cursor: "pointer",
            }}>
            {n}
          </button>
        ))}
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", cursor: page === totalPages ? "default" : "pointer" }}>
          Next
        </button>
      </div>
      <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
        Page {page} of {totalPages} ({ALL_ITEMS.length} items)
      </p>
    </div>
  );
}

render(<Pagination />);`},{name:"Search Filter",jsx:!0,code:`// ===== MACHINE CODING: Real-time Search Filter =====
// Build a search filter for a product list.
// - Filter items as the user types (real-time)
// - Case-insensitive matching on name and category
// - Show match count
// - Highlight "no results" state

const PRODUCTS = [
  { id: 1, name: "MacBook Pro", category: "Laptops", price: 1999 },
  { id: 2, name: "iPhone 15", category: "Phones", price: 999 },
  { id: 3, name: "AirPods Pro", category: "Audio", price: 249 },
  { id: 4, name: "iPad Air", category: "Tablets", price: 599 },
  { id: 5, name: "Apple Watch", category: "Wearables", price: 399 },
  { id: 6, name: "Samsung Galaxy S24", category: "Phones", price: 849 },
  { id: 7, name: "Sony WH-1000XM5", category: "Audio", price: 349 },
  { id: 8, name: "Dell XPS 15", category: "Laptops", price: 1499 },
  { id: 9, name: "Google Pixel 8", category: "Phones", price: 699 },
  { id: 10, name: "Nintendo Switch", category: "Gaming", price: 299 },
  { id: 11, name: "Steam Deck", category: "Gaming", price: 449 },
  { id: 12, name: "Kindle Paperwhite", category: "Tablets", price: 139 },
];

function SearchFilter() {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 460 }}>
      <h3 style={{ marginTop: 0 }}>Product Search</h3>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name or category..."
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box",
        }}
      />
      <p style={{ fontSize: 13, color: "#888", margin: "8px 0" }}>
        Showing {filtered.length} of {PRODUCTS.length} products
      </p>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: "#999" }}>
          No products match "{query}"
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              padding: "10px 14px", background: "#f8f8f8", borderRadius: 8,
              border: "1px solid #eee", display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <strong>{p.name}</strong>
                <div style={{ fontSize: 12, color: "#888" }}>{p.category}</div>
              </div>
              <span style={{ fontWeight: 600, color: "#4f46e5" }}>\${p.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

render(<SearchFilter />);`},{name:"Chat App",jsx:!0,code:`// ===== MACHINE CODING: Real-time Chat Application =====
// Build a chat app with multiple users.
// - Switch between users
// - Send messages
// - Messages appear in real-time
// - Auto-scroll to latest message
// - Simulated bot replies

function ChatApp() {
  const [messages, setMessages] = React.useState([
    { id: 1, user: "Alice", text: "Hey! Ready for the interview prep?", time: "10:00 AM" },
    { id: 2, user: "Bob", text: "Yes! Let's discuss React patterns.", time: "10:01 AM" },
  ]);
  const [input, setInput] = React.useState("");
  const [currentUser, setCurrentUser] = React.useState("Alice");
  const bottomRef = React.useRef(null);
  const users = ["Alice", "Bob", "Charlie"];

  const userColors = { Alice: "#4f46e5", Bob: "#059669", Charlie: "#d97706" };

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, {
      id: Date.now(), user: currentUser, text: input.trim(), time,
    }]);
    setInput("");

    // Simulate a reply from another user
    const others = users.filter(u => u !== currentUser);
    const replier = others[Math.floor(Math.random() * others.length)];
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const replies = ["That's a great point!", "I agree!", "Can you elaborate?", "Interesting approach!", "Let me think about that..."];
      setMessages(prev => [...prev, {
        id: Date.now(), user: replier,
        text: replies[Math.floor(Math.random() * replies.length)], time: replyTime,
      }]);
    }, 1000 + Math.random() * 1500);
  };

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 440, border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", background: "#4f46e5", color: "#fff" }}>
        <strong>Chat Room</strong>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{users.length} participants</div>
      </div>

      {/* User switcher */}
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
        {users.map(u => (
          <button key={u} onClick={() => setCurrentUser(u)}
            style={{
              padding: "4px 12px", borderRadius: 16, border: "none", fontSize: 12,
              background: u === currentUser ? userColors[u] : "#e0e0e0",
              color: u === currentUser ? "#fff" : "#333", cursor: "pointer",
            }}>
            {u}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ height: 280, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map(msg => {
          const isMe = msg.user === currentUser;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              <span style={{ fontSize: 11, color: userColors[msg.user], fontWeight: 600, marginBottom: 2 }}>
                {msg.user}
              </span>
              <div style={{
                padding: "8px 12px", borderRadius: 12, maxWidth: "75%", fontSize: 14,
                background: isMe ? "#4f46e5" : "#f0f0f0",
                color: isMe ? "#fff" : "#333",
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{msg.time}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e0e0e0" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={\`Message as \${currentUser}...\`}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
        />
        <button onClick={sendMessage}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
}

render(<ChatApp />);`},{name:"Modal Component",jsx:!0,code:`// ===== MACHINE CODING: Reusable Modal Component =====
// Build a reusable modal that:
// - Can be triggered by different buttons
// - Handles different content types (text, form, confirmation)
// - Has a close button and backdrop click to dismiss
// - Supports keyboard (Escape to close)
// - Animates in/out

function Modal({ isOpen, onClose, title, children }) {
  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12, padding: 24, minWidth: 320,
        maxWidth: "90%", maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "slideUp 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999", padding: 4 }}>
            x
          </button>
        </div>
        {children}
      </div>
      <style>{\`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      \`}</style>
    </div>
  );
}

function App() {
  const [activeModal, setActiveModal] = React.useState(null);
  const [formData, setFormData] = React.useState({ name: "", email: "" });

  const close = () => setActiveModal(null);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Reusable Modal</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setActiveModal("info")}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}>
          Info Modal
        </button>
        <button onClick={() => setActiveModal("form")}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#059669", color: "#fff", border: "none", cursor: "pointer" }}>
          Form Modal
        </button>
        <button onClick={() => setActiveModal("confirm")}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
          Confirm Modal
        </button>
      </div>
      <p style={{ color: "#888", fontSize: 13 }}>Press Escape or click backdrop to close</p>

      {/* Info Modal */}
      <Modal isOpen={activeModal === "info"} onClose={close} title="Information">
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          This is a reusable modal component. It supports different content types,
          keyboard dismissal (Escape), and backdrop click to close.
        </p>
        <button onClick={close}
          style={{ padding: "8px 20px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}>
          Got it
        </button>
      </Modal>

      {/* Form Modal */}
      <Modal isOpen={activeModal === "form"} onClose={close} title="Contact Form">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Name" value={formData.name}
            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <input placeholder="Email" value={formData.email}
            onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <button onClick={() => { console.log("Submitted:", formData); close(); }}
            style={{ padding: "10px 20px", borderRadius: 8, background: "#059669", color: "#fff", border: "none", cursor: "pointer" }}>
            Submit
          </button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal isOpen={activeModal === "confirm"} onClose={close} title="Are you sure?">
        <p style={{ color: "#555" }}>This action cannot be undone. Do you want to proceed?</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={close}
            style={{ padding: "8px 20px", borderRadius: 8, background: "#e5e5e5", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => { console.log("Confirmed!"); close(); }}
            style={{ padding: "8px 20px", borderRadius: 8, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

render(<App />);`},{name:"Image Gallery + Lazy Load",jsx:!0,code:`// ===== MACHINE CODING: Image Gallery with Lazy Loading =====
// Build an image gallery that:
// - Lazy loads images as they enter the viewport
// - Uses IntersectionObserver for efficient loading
// - Shows placeholder while loading
// - Displays in a responsive grid

function LazyImage({ src, alt, style }) {
  const [loaded, setLoaded] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      ...style, background: loaded ? "transparent" : "#e0e0e0",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", position: "relative",
    }}>
      {!loaded && (
        <div style={{ color: "#999", fontSize: 13 }}>Loading...</div>
      )}
      {inView && (
        <img
          src={src} alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease",
          }}
        />
      )}
    </div>
  );
}

function ImageGallery() {
  // Generate placeholder image URLs with different colors
  const images = Array.from({ length: 24 }, (_, i) => {
    const hue = (i * 37) % 360;
    const id = i + 10;
    return {
      id: i,
      src: \`https://picsum.photos/seed/\${id}/400/300\`,
      alt: \`Photo \${i + 1}\`,
      color: \`hsl(\${hue}, 60%, 70%)\`,
    };
  });

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Lazy-Loaded Image Gallery</h3>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
        Scroll down to see images load as they enter the viewport
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 8, maxHeight: 400, overflowY: "auto", padding: 4,
      }}>
        {images.map(img => (
          <LazyImage
            key={img.id}
            src={img.src}
            alt={img.alt}
            style={{
              height: 120, borderRadius: 8, background: img.color,
              border: "1px solid #e0e0e0",
            }}
          />
        ))}
      </div>
    </div>
  );
}

render(<ImageGallery />);`},{name:"Drag and Drop",jsx:!0,code:`// ===== MACHINE CODING: Drag-and-Drop Interface =====
// Build a drag-and-drop interface to:
// - Reorder items within a list
// - Drag items between two lists
// - Visual feedback during drag

function DragDropApp() {
  const [todo, setTodo] = React.useState([
    { id: "1", text: "Learn React hooks" },
    { id: "2", text: "Build a portfolio" },
    { id: "3", text: "Study system design" },
    { id: "4", text: "Practice algorithms" },
  ]);
  const [done, setDone] = React.useState([
    { id: "5", text: "Setup dev environment" },
    { id: "6", text: "Read React docs" },
  ]);
  const [dragItem, setDragItem] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);

  const handleDragStart = (item, source) => {
    setDragItem({ ...item, source });
  };

  const handleDrop = (target) => {
    if (!dragItem) return;
    const { source } = dragItem;
    const item = { id: dragItem.id, text: dragItem.text };

    // Remove from source
    if (source === "todo") setTodo(prev => prev.filter(i => i.id !== item.id));
    else setDone(prev => prev.filter(i => i.id !== item.id));

    // Add to target
    if (target === "todo") setTodo(prev => [...prev, item]);
    else setDone(prev => [...prev, item]);

    setDragItem(null);
    setDragOver(null);
  };

  const renderList = (items, listId, title, color) => (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(listId); }}
      onDragLeave={() => setDragOver(null)}
      onDrop={() => handleDrop(listId)}
      style={{
        flex: 1, minWidth: 180, padding: 12, borderRadius: 12,
        background: dragOver === listId ? \`\${color}22\` : "#f8f8f8",
        border: \`2px dashed \${dragOver === listId ? color : "#e0e0e0"}\`,
        transition: "all 0.2s ease",
      }}
    >
      <h4 style={{ margin: "0 0 12px", color, display: "flex", justifyContent: "space-between" }}>
        {title}
        <span style={{
          background: color, color: "#fff", borderRadius: 12,
          padding: "2px 10px", fontSize: 13,
        }}>
          {items.length}
        </span>
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
        {items.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item, listId)}
            onDragEnd={() => { setDragItem(null); setDragOver(null); }}
            style={{
              padding: "10px 12px", background: "#fff", borderRadius: 8,
              border: "1px solid #e0e0e0", cursor: "grab", fontSize: 14,
              opacity: dragItem?.id === item.id ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {item.text}
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "#bbb", fontSize: 13 }}>
            Drop items here
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Drag & Drop Lists</h3>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
        Drag items between the two lists
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {renderList(todo, "todo", "To Do", "#d97706")}
        {renderList(done, "done", "Done", "#059669")}
      </div>
    </div>
  );
}

render(<DragDropApp />);`},{name:"Product List Sort & Filter",jsx:!0,code:`// ===== MACHINE CODING: Product List with Sorting & Filtering =====
// Build a product list with:
// - Sort by price or rating (asc/desc)
// - Filter by category and price range
// - Show active filters and clear option

const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", category: "Audio", price: 79, rating: 4.5 },
  { id: 2, name: "Bluetooth Speaker", category: "Audio", price: 49, rating: 4.2 },
  { id: 3, name: "USB-C Hub", category: "Accessories", price: 35, rating: 4.0 },
  { id: 4, name: "Mechanical Keyboard", category: "Peripherals", price: 129, rating: 4.7 },
  { id: 5, name: "Gaming Mouse", category: "Peripherals", price: 59, rating: 4.4 },
  { id: 6, name: "Webcam HD", category: "Accessories", price: 69, rating: 3.9 },
  { id: 7, name: "Monitor Stand", category: "Accessories", price: 45, rating: 4.1 },
  { id: 8, name: "Noise Cancelling Earbuds", category: "Audio", price: 149, rating: 4.6 },
  { id: 9, name: "Laptop Stand", category: "Accessories", price: 39, rating: 4.3 },
  { id: 10, name: "Wireless Mouse", category: "Peripherals", price: 29, rating: 3.8 },
  { id: 11, name: "Desk Pad", category: "Accessories", price: 25, rating: 4.0 },
  { id: 12, name: "Studio Mic", category: "Audio", price: 199, rating: 4.8 },
];

const categories = [...new Set(PRODUCTS.map(p => p.category))];

function ProductList() {
  const [sortBy, setSortBy] = React.useState("name");
  const [sortDir, setSortDir] = React.useState("asc");
  const [category, setCategory] = React.useState("all");
  const [maxPrice, setMaxPrice] = React.useState(200);

  const filtered = React.useMemo(() => {
    let items = PRODUCTS.filter(p => p.price <= maxPrice);
    if (category !== "all") items = items.filter(p => p.category === category);
    items.sort((a, b) => {
      const va = a[sortBy], vb = b[sortBy];
      const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [sortBy, sortDir, category, maxPrice]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("asc"); }
  };

  const clearFilters = () => { setCategory("all"); setMaxPrice(200); setSortBy("name"); setSortDir("asc"); };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>Product List</h3>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd" }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13 }}>Max $</span>
          <input type="range" min={0} max={200} value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: 100 }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>\${maxPrice}</span>
        </div>
        <button onClick={clearFilters}
          style={{ padding: "6px 12px", borderRadius: 6, background: "#f0f0f0", border: "1px solid #ddd", cursor: "pointer", fontSize: 12 }}>
          Clear
        </button>
      </div>

      {/* Sort buttons */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[["name", "Name"], ["price", "Price"], ["rating", "Rating"]].map(([key, label]) => (
          <button key={key} onClick={() => toggleSort(key)}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              background: sortBy === key ? "#4f46e5" : "#f0f0f0",
              color: sortBy === key ? "#fff" : "#333",
              border: sortBy === key ? "1px solid #4f46e5" : "1px solid #ddd",
            }}>
            {label} {sortBy === key ? (sortDir === "asc" ? " \\u2191" : " \\u2193") : ""}
          </button>
        ))}
      </div>

      {/* Product cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: 20 }}>No products match your filters</p>
        ) : filtered.map(p => (
          <div key={p.id} style={{
            padding: "10px 14px", background: "#f8f8f8", borderRadius: 8,
            border: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <strong>{p.name}</strong>
              <div style={{ fontSize: 12, color: "#888" }}>{p.category}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600, color: "#4f46e5" }}>\${p.price}</div>
              <div style={{ fontSize: 12, color: "#f59e0b" }}>{"\\u2605".repeat(Math.round(p.rating))} {p.rating}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>{filtered.length} products shown</p>
    </div>
  );
}

render(<ProductList />);`},{name:"Responsive Navbar",jsx:!0,code:`// ===== MACHINE CODING: Responsive Navbar =====
// Build a responsive navbar that:
// - Shows full menu on desktop
// - Collapses to hamburger menu on mobile
// - Smooth slide-in mobile menu
// - Active link highlighting
// - Resize to see it adapt!

function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [active, setActive] = React.useState("Home");
  const [width, setWidth] = React.useState(400);

  const links = ["Home", "About", "Services", "Portfolio", "Blog", "Contact"];

  const isMobile = width < 500;

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <p style={{ fontSize: 13, color: "#888", margin: "0 0 8px", padding: "0 8px" }}>
        Drag slider to simulate viewport: {width}px
      </p>
      <input type="range" min={280} max={700} value={width}
        onChange={e => { setWidth(Number(e.target.value)); setMenuOpen(false); }}
        style={{ width: "100%", marginBottom: 12 }} />

      {/* Simulated viewport */}
      <div style={{ width, margin: "0 auto", border: "2px solid #ddd", borderRadius: 12, overflow: "hidden", transition: "width 0.3s" }}>
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "#1a1a2e", color: "#fff", position: "relative",
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#818cf8" }}>PrepHub</div>

          {/* Desktop links */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 4 }}>
              {links.map(link => (
                <button key={link} onClick={() => setActive(link)}
                  style={{
                    background: active === link ? "#4f46e5" : "transparent",
                    color: "#fff", border: "none", padding: "6px 12px",
                    borderRadius: 6, cursor: "pointer", fontSize: 13,
                    transition: "background 0.2s",
                  }}>
                  {link}
                </button>
              ))}
            </div>
          )}

          {/* Hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(m => !m)}
              style={{
                background: "none", border: "none", color: "#fff",
                fontSize: 22, cursor: "pointer", padding: 4, lineHeight: 1,
              }}>
              {menuOpen ? "\\u2715" : "\\u2630"}
            </button>
          )}
        </nav>

        {/* Mobile menu */}
        {isMobile && (
          <div style={{
            maxHeight: menuOpen ? links.length * 48 : 0,
            overflow: "hidden", background: "#16162a",
            transition: "max-height 0.3s ease",
          }}>
            {links.map(link => (
              <button key={link}
                onClick={() => { setActive(link); setMenuOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 20px", background: active === link ? "#4f46e5" : "transparent",
                  color: "#fff", border: "none", borderTop: "1px solid #2a2a4a",
                  cursor: "pointer", fontSize: 14,
                }}>
                {link}
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <div style={{ padding: 24, background: "#fff", minHeight: 120 }}>
          <h2 style={{ margin: "0 0 8px", color: "#1a1a2e" }}>{active}</h2>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
            This is the {active.toLowerCase()} page content. Resize the viewport above to see the navbar adapt.
          </p>
        </div>
      </div>
    </div>
  );
}

render(<Navbar />);`},{name:"Infinite Scroll",jsx:!0,code:`// ===== MACHINE CODING: Infinite Scrolling List =====
// Build an infinite scrolling list that:
// - Loads more items when scrolling near the bottom
// - Uses IntersectionObserver (no scroll event listener)
// - Shows loading indicator
// - Handles "no more data" state

function fakeAPI(page) {
  const totalPages = 8;
  return new Promise(resolve =>
    setTimeout(() => {
      if (page > totalPages) return resolve({ items: [], hasMore: false });
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: (page - 1) * 10 + i + 1,
        title: \`Post #\${(page - 1) * 10 + i + 1}\`,
        body: \`This is the content for post \${(page - 1) * 10 + i + 1}. It was loaded on page \${page}.\`,
        author: ["Alice", "Bob", "Charlie", "Diana"][((page - 1) * 10 + i) % 4],
      }));
      resolve({ items, hasMore: page < totalPages });
    }, 500 + Math.random() * 500)
  );
}

function InfiniteScroll() {
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const sentinelRef = React.useRef(null);

  const loadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    fakeAPI(page).then(res => {
      setItems(prev => [...prev, ...res.items]);
      setHasMore(res.hasMore);
      setPage(p => p + 1);
      setLoading(false);
    });
  }, [page, loading, hasMore]);

  // Initial load
  React.useEffect(() => { loadMore(); }, []);

  // IntersectionObserver for sentinel element
  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const colors = { Alice: "#4f46e5", Bob: "#059669", Charlie: "#d97706", Diana: "#dc2626" };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", maxWidth: 440 }}>
      <h3 style={{ marginTop: 0 }}>Infinite Scroll Feed</h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
        {items.length} items loaded. {hasMore ? "Scroll down for more." : "All items loaded!"}
      </p>
      <div style={{ maxHeight: 400, overflowY: "auto", borderRadius: 12, border: "1px solid #e0e0e0" }}>
        {items.map(item => (
          <div key={item.id} style={{
            padding: "12px 16px", borderBottom: "1px solid #f0f0f0",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 14 }}>{item.title}</strong>
              <span style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 10,
                background: colors[item.author] + "18", color: colors[item.author],
                fontWeight: 600,
              }}>
                {item.author}
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{item.body}</p>
          </div>
        ))}

        {/* Sentinel element for IntersectionObserver */}
        {hasMore && (
          <div ref={sentinelRef} style={{ padding: 20, textAlign: "center" }}>
            {loading && <span style={{ color: "#888" }}>Loading more...</span>}
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div style={{ padding: 16, textAlign: "center", color: "#999", fontSize: 13 }}>
            You've reached the end!
          </div>
        )}
      </div>
    </div>
  );
}

render(<InfiniteScroll />);`},{name:"Notifications",jsx:!0,code:`// ===== MACHINE CODING: Real-time Notifications =====
// Build a notifications system that:
// - Shows toast notifications dynamically
// - Supports different types (success, error, warning, info)
// - Auto-dismiss after timeout
// - Manual dismiss with close button
// - Stacked positioning with animation

function useNotifications() {
  const [notifications, setNotifications] = React.useState([]);

  const add = React.useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = React.useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, add, dismiss };
}

function Toast({ notification, onDismiss }) {
  const colors = {
    success: { bg: "#ecfdf5", border: "#059669", icon: "\\u2705" },
    error:   { bg: "#fef2f2", border: "#dc2626", icon: "\\u274C" },
    warning: { bg: "#fffbeb", border: "#d97706", icon: "\\u26A0\\uFE0F" },
    info:    { bg: "#eff6ff", border: "#3b82f6", icon: "\\u2139\\uFE0F" },
  };
  const c = colors[notification.type] || colors.info;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 8, marginBottom: 8,
      background: c.bg, borderLeft: \`4px solid \${c.border}\`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      animation: "slideIn 0.3s ease", minWidth: 260,
    }}>
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: "#333" }}>{notification.message}</span>
      <button onClick={() => onDismiss(notification.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 16, padding: 2 }}>
        x
      </button>
    </div>
  );
}

function App() {
  const { notifications, add, dismiss } = useNotifications();
  const [autoCount, setAutoCount] = React.useState(0);

  // Simulate real-time notifications
  React.useEffect(() => {
    const events = [
      { msg: "New message from Alice", type: "info" },
      { msg: "Deployment successful!", type: "success" },
      { msg: "High memory usage detected", type: "warning" },
      { msg: "Build failed on main branch", type: "error" },
    ];
    const interval = setInterval(() => {
      setAutoCount(c => {
        if (c < 3) {
          const evt = events[c % events.length];
          add(evt.msg, evt.type);
        }
        return c + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <style>{\`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      \`}</style>

      <h3 style={{ marginTop: 0 }}>Notification System</h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
        Click buttons or wait for auto-notifications. They dismiss after 3s.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => add("Operation completed!", "success")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#059669", color: "#fff", border: "none", cursor: "pointer" }}>
          Success
        </button>
        <button onClick={() => add("Something went wrong!", "error")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
          Error
        </button>
        <button onClick={() => add("Please check your input", "warning")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#d97706", color: "#fff", border: "none", cursor: "pointer" }}>
          Warning
        </button>
        <button onClick={() => add("You have 3 new updates", "info")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer" }}>
          Info
        </button>
        <button onClick={() => add("This one stays! Click x to dismiss.", "info", 0)}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#6b7280", color: "#fff", border: "none", cursor: "pointer" }}>
          Persistent
        </button>
      </div>

      {/* Notification container */}
      <div style={{ position: "relative" }}>
        {notifications.length === 0 ? (
          <p style={{ color: "#ccc", fontSize: 13 }}>No notifications. Click a button or wait...</p>
        ) : (
          notifications.map(n => <Toast key={n.id} notification={n} onDismiss={dismiss} />)
        )}
      </div>
    </div>
  );
}

render(<App />);`},{name:"Star Rating",jsx:!0,code:`// ===== MACHINE CODING: Star Rating =====
// 5-star rating component with hover preview.
// - Click to set rating
// - Hover to preview the rating
// - Half-stars optional (basic version: whole stars only)

function StarRating({ totalStars = 5, initialRating = 0, onChange }) {
  const [rating, setRating] = React.useState(initialRating);
  const [hover, setHover] = React.useState(0);

  function handleSelect(value) {
    setRating(value);
    onChange?.(value);
  }

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: totalStars }, (_, i) => {
        const value = i + 1;
        const filled = value <= (hover || rating);
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 32, padding: 0, lineHeight: 1,
              color: filled ? "#fbbf24" : "#444",
              transition: "color 0.15s",
            }}
            aria-label={\`Rate \${value} of \${totalStars}\`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [rating, setRating] = React.useState(0);
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Star Rating</h2>
      <StarRating onChange={setRating} />
      <p style={{ marginTop: 16, color: "#aaa" }}>
        Current rating: <strong style={{ color: "#fbbf24" }}>{rating}/5</strong>
      </p>
    </div>
  );
}

render(<App />);`},{name:"Tabs",jsx:!0,code:`// ===== MACHINE CODING: Tabs Component =====
// Compound component pattern: <Tabs> + <Tabs.Tab> + <Tabs.Panel>
// share state via Context. The user composes; the library wires it.

const TabsContext = React.createContext(null);

function Tabs({ children, defaultIndex = 0 }) {
  const [active, setActive] = React.useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #444" }}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #444", background: "#222" }}>
      {children}
    </div>
  );
};

Tabs.Tab = function Tab({ index, children }) {
  const { active, setActive } = React.useContext(TabsContext);
  const isActive = active === index;
  return (
    <button
      onClick={() => setActive(index)}
      style={{
        flex: 1, padding: "12px 16px", border: "none", cursor: "pointer",
        background: isActive ? "#1e293b" : "transparent",
        color: isActive ? "#60a5fa" : "#aaa",
        borderBottom: isActive ? "2px solid #60a5fa" : "2px solid transparent",
        fontWeight: isActive ? 600 : 400, fontSize: 14, transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ index, children }) {
  const { active } = React.useContext(TabsContext);
  if (active !== index) return null;
  return <div style={{ padding: 20, color: "#ddd", background: "#1e293b" }}>{children}</div>;
};

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Tabs Component</h2>
      <Tabs defaultIndex={0}>
        <Tabs.List>
          <Tabs.Tab index={0}>Profile</Tabs.Tab>
          <Tabs.Tab index={1}>Settings</Tabs.Tab>
          <Tabs.Tab index={2}>Billing</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel index={0}>
          <h3>Profile</h3><p>Manage your profile information.</p>
        </Tabs.Panel>
        <Tabs.Panel index={1}>
          <h3>Settings</h3><p>App preferences and notifications.</p>
        </Tabs.Panel>
        <Tabs.Panel index={2}>
          <h3>Billing</h3><p>Subscription and payment methods.</p>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

render(<App />);`},{name:"Accordion",jsx:!0,code:`// ===== MACHINE CODING: Accordion =====
// Expand/collapse panels. Supports single-open or multi-open mode.
// - allowMultiple={true}: many panels open at once
// - allowMultiple={false}: only one open at a time (radio-like)

function Accordion({ items, allowMultiple = false }) {
  const [openIds, setOpenIds] = React.useState(new Set());

  function toggle(id) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div style={{ border: "1px solid #444", borderRadius: 8, overflow: "hidden" }}>
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} style={{ borderBottom: "1px solid #333" }}>
            <button
              onClick={() => toggle(item.id)}
              style={{
                width: "100%", padding: "14px 16px", border: "none", cursor: "pointer",
                background: isOpen ? "#1e293b" : "#222", color: "#fff",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 15, fontWeight: 500, textAlign: "left",
              }}
            >
              <span>{item.title}</span>
              <span style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s", color: "#60a5fa",
              }}>▼</span>
            </button>
            {isOpen && (
              <div style={{ padding: "14px 16px", background: "#0f172a", color: "#cbd5e1", fontSize: 14 }}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const items = [
    { id: 1, title: "What is React?", content: "A JavaScript library for building user interfaces." },
    { id: 2, title: "What are hooks?", content: "Functions that let you use state and lifecycle in function components." },
    { id: 3, title: "What is reconciliation?", content: "React's algorithm for diffing the virtual DOM and updating the real DOM efficiently." },
  ];
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Accordion (single-open)</h2>
      <Accordion items={items} allowMultiple={false} />
      <h2 style={{ marginTop: 24 }}>Accordion (multi-open)</h2>
      <Accordion items={items} allowMultiple={true} />
    </div>
  );
}

render(<App />);`},{name:"OTP Input",jsx:!0,code:`// ===== MACHINE CODING: OTP Input =====
// 6-digit OTP input that:
// - Auto-advances to next field on input
// - Backspace moves to previous field when current is empty
// - Accepts digits only
// - Paste support: distributes digits across fields

function OTPInput({ length = 6, onComplete }) {
  const [digits, setDigits] = React.useState(Array(length).fill(""));
  const refs = React.useRef([]);

  React.useEffect(() => {
    if (digits.every(d => d !== "")) onComplete?.(digits.join(""));
  }, [digits]);

  function handleChange(i, value) {
    if (!/^\\d?$/.test(value)) return;   // digits only, single char
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < length - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div style={{ display: "flex", gap: 8 }} onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          style={{
            width: 44, height: 52, textAlign: "center",
            fontSize: 22, fontWeight: 600, border: "1px solid #444",
            background: "#1e293b", color: "#fff", borderRadius: 8,
            outline: "none", caretColor: "#60a5fa",
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [otp, setOtp] = React.useState("");
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>OTP Input</h2>
      <p style={{ color: "#aaa", marginBottom: 16 }}>
        Enter the 6-digit code (or paste it):
      </p>
      <OTPInput onComplete={setOtp} />
      {otp && (
        <p style={{ marginTop: 20, color: "#10b981", fontWeight: 600 }}>
          ✓ Submitted: {otp}
        </p>
      )}
    </div>
  );
}

render(<App />);`},{name:"Tic-Tac-Toe",jsx:!0,code:`// ===== MACHINE CODING: Tic-Tac-Toe =====
// Classic 3x3 tic-tac-toe.
// - Two players (X and O) alternate
// - Detect winner across rows, columns, diagonals
// - Detect draw
// - Reset button

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],     // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],     // cols
  [0, 4, 8], [2, 4, 6],                // diagonals
];

function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function Square({ value, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 70, height: 70, fontSize: 32, fontWeight: 700,
        background: highlight ? "#10b981" : "#1e293b",
        color: value === "X" ? "#60a5fa" : value === "O" ? "#f87171" : "#fff",
        border: "1px solid #444", cursor: value ? "default" : "pointer",
        transition: "background 0.2s",
      }}
    >
      {value}
    </button>
  );
}

function App() {
  const [squares, setSquares] = React.useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = React.useState(true);

  const result = calculateWinner(squares);
  const winner = result?.winner;
  const isDraw = !winner && squares.every(Boolean);

  function handleClick(i) {
    if (squares[i] || winner) return;
    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  function reset() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  const status = winner
    ? \`🏆 Winner: \${winner}\`
    : isDraw
    ? "🤝 Draw"
    : \`Turn: \${xIsNext ? "X" : "O"}\`;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff", textAlign: "center" }}>
      <h2>Tic-Tac-Toe</h2>
      <p style={{ fontSize: 18, color: winner ? "#10b981" : "#aaa", margin: "12px 0 20px" }}>
        {status}
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 70px)",
        gap: 4, justifyContent: "center", marginBottom: 20,
      }}>
        {squares.map((value, i) => (
          <Square
            key={i}
            value={value}
            onClick={() => handleClick(i)}
            highlight={result?.line.includes(i)}
          />
        ))}
      </div>
      <button
        onClick={reset}
        style={{
          padding: "10px 20px", background: "#3b82f6", color: "#fff",
          border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}
      >
        Reset
      </button>
    </div>
  );
}

render(<App />);`},{name:"Stopwatch",jsx:!0,code:`// ===== MACHINE CODING: Stopwatch =====
// Start, pause, resume, reset. Display HH:MM:SS.ms.
// Uses requestAnimationFrame for smooth millisecond updates.

function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor((ms % 1000) / 10);
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  return \`\${pad(hours)}:\${pad(minutes)}:\${pad(seconds)}.\${pad(millis)}\`;
}

function App() {
  const [elapsed, setElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const startRef = React.useRef(0);
  const baseRef = React.useRef(0);
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    if (!running) return;
    const tick = () => {
      setElapsed(baseRef.current + (Date.now() - startRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  function start() {
    startRef.current = Date.now();
    setRunning(true);
  }
  function pause() {
    baseRef.current = elapsed;
    setRunning(false);
  }
  function reset() {
    baseRef.current = 0;
    setElapsed(0);
    setRunning(false);
  }

  const btnStyle = (color) => ({
    padding: "10px 20px", border: "none", borderRadius: 8,
    color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
    background: color, marginRight: 8,
  });

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff", textAlign: "center" }}>
      <h2>Stopwatch</h2>
      <div style={{
        fontSize: 48, fontFamily: "monospace", margin: "24px 0",
        background: "#0f172a", padding: "20px 24px", borderRadius: 12,
        color: "#60a5fa", letterSpacing: 2,
      }}>
        {formatTime(elapsed)}
      </div>
      {!running ? (
        <button onClick={start} style={btnStyle("#10b981")}>
          {elapsed > 0 ? "Resume" : "Start"}
        </button>
      ) : (
        <button onClick={pause} style={btnStyle("#f59e0b")}>Pause</button>
      )}
      <button onClick={reset} style={btnStyle("#475569")}>Reset</button>
    </div>
  );
}

render(<App />);`},{name:"Calculator",jsx:!0,code:`// ===== MACHINE CODING: Calculator =====
// Standard 4-function calculator with display, digits, ops, equals, clear.

function App() {
  const [display, setDisplay] = React.useState("0");
  const [previous, setPrevious] = React.useState(null);
  const [op, setOp] = React.useState(null);
  const [overwrite, setOverwrite] = React.useState(false);

  function inputDigit(d) {
    if (overwrite) {
      setDisplay(d);
      setOverwrite(false);
    } else {
      setDisplay(display === "0" ? d : display + d);
    }
  }

  function inputDot() {
    if (overwrite) { setDisplay("0."); setOverwrite(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  }

  function chooseOp(nextOp) {
    const value = parseFloat(display);
    if (previous == null) {
      setPrevious(value);
    } else if (op) {
      const result = compute(previous, value, op);
      setDisplay(String(result));
      setPrevious(result);
    }
    setOp(nextOp);
    setOverwrite(true);
  }

  function compute(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? 0 : a / b;
      default: return b;
    }
  }

  function equals() {
    if (op == null || previous == null) return;
    const value = parseFloat(display);
    setDisplay(String(compute(previous, value, op)));
    setPrevious(null);
    setOp(null);
    setOverwrite(true);
  }

  function clear() {
    setDisplay("0"); setPrevious(null); setOp(null); setOverwrite(false);
  }

  const btn = (label, onClick, bg = "#1e293b") => (
    <button
      onClick={onClick}
      style={{
        padding: 16, fontSize: 18, border: "none", borderRadius: 8,
        background: bg, color: "#fff", cursor: "pointer", fontWeight: 600,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Calculator</h2>
      <div style={{
        background: "#0f172a", padding: 20, borderRadius: 12,
        fontSize: 36, textAlign: "right", color: "#60a5fa",
        fontFamily: "monospace", marginBottom: 12, minHeight: 60,
      }}>
        {display}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {btn("C", clear, "#dc2626")}
        {btn("/", () => chooseOp("/"), "#f59e0b")}
        {btn("*", () => chooseOp("*"), "#f59e0b")}
        {btn("-", () => chooseOp("-"), "#f59e0b")}
        {btn("7", () => inputDigit("7"))}{btn("8", () => inputDigit("8"))}{btn("9", () => inputDigit("9"))}
        {btn("+", () => chooseOp("+"), "#f59e0b")}
        {btn("4", () => inputDigit("4"))}{btn("5", () => inputDigit("5"))}{btn("6", () => inputDigit("6"))}
        {btn("=", equals, "#10b981")}
        {btn("1", () => inputDigit("1"))}{btn("2", () => inputDigit("2"))}{btn("3", () => inputDigit("3"))}
        {btn(".", inputDot)}
        {btn("0", () => inputDigit("0"))}
      </div>
    </div>
  );
}

render(<App />);`},{name:"Auto-suggest",jsx:!0,code:`// ===== MACHINE CODING: Auto-suggest / Typeahead =====
// Filter a list as the user types. Keyboard navigation (arrow keys + Enter).
// Click outside to close the dropdown.

const ALL_FRUITS = [
  "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry",
  "Cherry", "Coconut", "Cranberry", "Date", "Dragonfruit", "Durian",
  "Fig", "Grape", "Grapefruit", "Guava", "Kiwi", "Lemon", "Lime",
  "Mango", "Melon", "Orange", "Papaya", "Peach", "Pear", "Pineapple",
  "Plum", "Raspberry", "Strawberry", "Watermelon",
];

function App() {
  const [query, setQuery] = React.useState("");
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  const matches = React.useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return ALL_FRUITS.filter(f => f.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  React.useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(matches[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function select(item) {
    setQuery(item);
    setOpen(false);
    setHighlightIndex(0);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Auto-suggest</h2>
      <div ref={containerRef} style={{ position: "relative", maxWidth: 320 }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlightIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type a fruit..."
          style={{
            width: "100%", padding: "10px 14px", fontSize: 15,
            background: "#1e293b", color: "#fff", border: "1px solid #444",
            borderRadius: 8, outline: "none",
          }}
        />
        {open && matches.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "#0f172a", border: "1px solid #444", borderTop: "none",
            borderRadius: "0 0 8px 8px", maxHeight: 240, overflowY: "auto",
            zIndex: 10,
          }}>
            {matches.map((item, i) => (
              <div
                key={item}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => select(item)}
                style={{
                  padding: "10px 14px", cursor: "pointer",
                  background: i === highlightIndex ? "#1e293b" : "transparent",
                  color: i === highlightIndex ? "#60a5fa" : "#cbd5e1",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Type · Arrow keys to navigate · Enter to select · Esc to close
      </p>
    </div>
  );
}

render(<App />);`},{name:"Toast / Snackbar",jsx:!0,code:`// ===== MACHINE CODING: Toast / Snackbar =====
// Toast queue with auto-dismiss. Stack multiple toasts.
// Trigger by calling a function (typical pattern: useToast hook).

function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const show = React.useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

function ToastContainer({ toasts, dismiss }) {
  const colors = {
    info:    { bg: "#1e293b", border: "#3b82f6", icon: "ℹ" },
    success: { bg: "#064e3b", border: "#10b981", icon: "✓" },
    error:   { bg: "#7f1d1d", border: "#ef4444", icon: "✕" },
    warn:    { bg: "#78350f", border: "#f59e0b", icon: "⚠" },
  };

  return (
    <div style={{
      position: "fixed", top: 20, right: 20, display: "flex",
      flexDirection: "column", gap: 8, zIndex: 1000,
    }}>
      {toasts.map((t) => {
        const c = colors[t.type] || colors.info;
        return (
          <div
            key={t.id}
            style={{
              minWidth: 280, padding: "12px 16px", background: c.bg,
              borderLeft: \`4px solid \${c.border}\`, borderRadius: 6,
              color: "#fff", display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              animation: "slideIn 0.2s ease",
            }}
          >
            <span style={{ fontSize: 18, color: c.border }}>{c.icon}</span>
            <span style={{ flex: 1, fontSize: 14 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16 }}
            >
              ×
            </button>
          </div>
        );
      })}
      <style>{\`@keyframes slideIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }\`}</style>
    </div>
  );
}

function App() {
  const { toasts, show, dismiss } = useToast();

  const btnStyle = (color) => ({
    padding: "10px 16px", border: "none", borderRadius: 6,
    background: color, color: "#fff", cursor: "pointer", marginRight: 8,
    fontSize: 14, fontWeight: 600,
  });

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Toast / Snackbar</h2>
      <p style={{ color: "#888" }}>Click a button to fire a toast (auto-dismiss in 3s).</p>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => show("Saved successfully", "success")} style={btnStyle("#10b981")}>Success</button>
        <button onClick={() => show("Heads up!", "warn")} style={btnStyle("#f59e0b")}>Warning</button>
        <button onClick={() => show("Something broke", "error")} style={btnStyle("#ef4444")}>Error</button>
        <button onClick={() => show("Here's some info", "info")} style={btnStyle("#3b82f6")}>Info</button>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

render(<App />);`},{name:"Carousel / Slider",jsx:!0,code:`// ===== MACHINE CODING: Carousel / Slider =====
// Image carousel with prev/next, dots, keyboard nav, auto-play.

const SLIDES = [
  { color: "#3b82f6", title: "Slide 1", subtitle: "Blue ocean" },
  { color: "#10b981", title: "Slide 2", subtitle: "Green meadow" },
  { color: "#f59e0b", title: "Slide 3", subtitle: "Golden sunset" },
  { color: "#ef4444", title: "Slide 4", subtitle: "Red sunrise" },
  { color: "#8b5cf6", title: "Slide 5", subtitle: "Purple dusk" },
];

function App() {
  const [index, setIndex] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(true);

  const next = React.useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = React.useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  React.useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [autoPlay, next]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") setAutoPlay((a) => !a);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Carousel</h2>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "flex",
          transform: \`translateX(\${-index * 100}%)\`,
          transition: "transform 0.4s ease",
        }}>
          {SLIDES.map((s, i) => (
            <div key={i} style={{
              flex: "0 0 100%", height: 240, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: s.color, color: "#fff",
            }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{s.title}</div>
              <div style={{ fontSize: 16, opacity: 0.85, marginTop: 4 }}>{s.subtitle}</div>
            </div>
          ))}
        </div>
        <button onClick={prev} style={{
          position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
          width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer",
        }}>‹</button>
        <button onClick={next} style={{
          position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
          width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer",
        }}>›</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: 10, height: 10, borderRadius: "50%", border: "none",
              background: i === index ? "#60a5fa" : "#444", cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
      <button
        onClick={() => setAutoPlay(!autoPlay)}
        style={{
          marginTop: 12, padding: "8px 14px", background: "#1e293b",
          color: "#fff", border: "1px solid #444", borderRadius: 6, cursor: "pointer",
        }}
      >
        {autoPlay ? "Pause" : "Play"} (Space)
      </button>
    </div>
  );
}

render(<App />);`}]}],S=N.flatMap(o=>o.templates.map(r=>({...r,category:o.label,tag:o.tag})));function xe({output:o,hasPreview:r,previewRef:l}){return e.jsxs("div",{className:"flex-1 flex flex-col min-h-0",children:[e.jsxs("div",{className:r?"flex-1 flex flex-col min-h-[160px] basis-0":"flex-1 flex flex-col min-h-[100px]",children:[e.jsxs("div",{className:"px-4 py-2 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500"}),"Console Output",o.length>0&&e.jsxs("span",{className:"ml-1 text-[10px] text-slate-600",children:["(",o.length,")"]})]}),e.jsx("div",{className:"flex-1 overflow-auto p-4 bg-[#1e1e2e] font-mono text-sm min-h-0",children:o.length===0&&!r?e.jsx("div",{className:"text-slate-500 italic",children:'Click "Run" or press ⌘+Enter to execute your code...'}):o.length===0?e.jsx("div",{className:"text-slate-600 italic text-xs",children:"No console output yet — logs will appear here."}):o.map((R,f)=>e.jsx(Se,{entry:R},f))})]}),e.jsxs("div",{className:r?"flex-1 flex flex-col min-h-[160px] basis-0 border-t border-[#2d333b]":"h-0 overflow-hidden",children:[e.jsxs("div",{className:"px-4 py-2 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-blue-500"}),"React Preview"]}),e.jsx("div",{ref:l,className:"flex-1 overflow-auto bg-white text-slate-900 p-2 min-h-0"})]})]})}const Se=s.memo(function({entry:r}){const l=r.type==="error"?"text-red-400":r.type==="warn"?"text-yellow-400":r.type==="result"?"text-blue-400":"text-[#a6e3a1]";return e.jsxs("div",{className:`py-1 border-b border-slate-800/50 last:border-0 ${l}`,children:[r.type==="error"&&e.jsx(de,{size:12,className:"inline mr-2"}),e.jsx("span",{className:"whitespace-pre-wrap",children:r.text})]})}),ve=s.memo(xe);function O(o){if(o===null)return"null";if(o===void 0)return"undefined";if(typeof o=="string")return o;if(typeof o=="function")return`[Function: ${o.name||"anonymous"}]`;if(o instanceof Error)return`${o.name}: ${o.message}`;try{return JSON.stringify(o,null,2)}catch{return String(o)}}function Y(o){return!!(/render\s*\(/.test(o)||/<[A-Z][A-Za-z0-9]*/.test(o)||/return\s*\(?\s*<[a-zA-Z]/.test(o)||/\b(useState|useEffect|useRef|useMemo|useCallback|useReducer|useContext|useLayoutEffect)\s*\(/.test(o))}let H=null;async function Ee(o){return H||(H=await le(()=>import("./babel-DgCu6knF.js").then(l=>l.b),__vite__mapDeps([0,1]))),H.transform(o,{presets:["react"],filename:"playground.jsx"}).code}function Re(){const o=sessionStorage.getItem("playground-code")||S[0].code,[r,l]=s.useState(o),[R,f]=s.useState([]),[T,v]=s.useState(!1),[I,$]=s.useState(!1),[X,E]=s.useState(!1),[u,K]=s.useState(sessionStorage.getItem("playground-code")?null:"Hello World"),[y,D]=s.useState(!1),[b,x]=s.useState(""),[C,B]=s.useState("all"),[w,P]=s.useState("all"),Z=s.useRef(null),L=s.useRef(null),a=s.useRef(null),j=s.useRef(null),i=s.useRef([]),p=s.useRef(null),U=Y(r),_=s.useMemo(()=>["all",...[...new Set(N.map(n=>n.tag))].map(n=>n.toLowerCase())],[]),h=s.useMemo(()=>N.filter(t=>C==="all"||t.tag.toLowerCase()===C).map(t=>({...t,templates:t.templates.filter(n=>n.name.toLowerCase().includes(b.toLowerCase()))})).filter(t=>t.templates.length>0),[b,C]);s.useEffect(()=>{sessionStorage.removeItem("playground-code")},[]),s.useEffect(()=>{const t=console.log,n=console.warn,c=console.error,m=g=>{i.current=[...i.current,g]};return console.log=(...g)=>{m({type:"log",text:g.map(O).join(" ")})},console.warn=(...g)=>{m({type:"warn",text:g.map(O).join(" ")})},console.error=(...g)=>{m({type:"error",text:g.map(O).join(" ")})},()=>{if(console.log=t,console.warn=n,console.error=c,p.current!==null&&(window.clearInterval(p.current),p.current=null),a.current){try{a.current.unmount()}catch{}a.current=null}}},[]);const M=s.useCallback(async()=>{if($(!0),i.current=[],f([]),a.current){try{a.current.unmount()}catch{}a.current=null}E(!1),p.current!==null&&(window.clearInterval(p.current),p.current=null);let t=!1;try{let n=r;const c=Y(r);if(c&&(n=await Ee(r)),c){const m=ae=>{if(L.current){if(a.current)try{a.current.unmount()}catch{}a.current=ie.createRoot(L.current),a.current.render(ae),E(!0),t=!0}},g={React:d,useState:d.useState,useEffect:d.useEffect,useRef:d.useRef,useMemo:d.useMemo,useCallback:d.useCallback,useReducer:d.useReducer,useContext:d.useContext,createContext:d.createContext,memo:d.memo,Fragment:d.Fragment,render:m},oe=Object.keys(g),re=Object.values(g);new Function(...oe,n)(...re),t||(i.current=[...i.current,{type:"error",text:"No render() call detected. For React components, end your code with: render(<YourComponent />);"}])}else{const m=new Function(n)();m!==void 0&&(i.current=[...i.current,{type:"result",text:`→ ${O(m)}`}])}}catch(n){i.current=[...i.current,{type:"error",text:`${n.name}: ${n.message}`}]}finally{$(!1)}f([...i.current]),t?p.current=window.setInterval(()=>{f(n=>n.length!==i.current.length?[...i.current]:n)},250):window.setTimeout(()=>f([...i.current]),600)},[r]);s.useEffect(()=>{const t=n=>{(n.metaKey||n.ctrlKey)&&n.key==="Enter"&&(n.preventDefault(),M()),n.key==="Escape"&&T&&v(!1)};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[M,T]);const k=s.useCallback(()=>{p.current!==null&&(window.clearInterval(p.current),p.current=null)},[]),Q=s.useCallback(t=>{if(k(),a.current){try{a.current.unmount()}catch{}a.current=null}i.current=[],l(t.code),f([]),E(!1),K(t.name),D(!1),v(!1),x("")},[k]),A=s.useMemo(()=>u?S.find(t=>t.name===u)??null:null,[u]),z=!!(u&&V[u]),ee=s.useCallback(()=>{if(!(!A||!z))if(y)l(A.code),D(!1);else{if(r!==A.code&&!window.confirm("Show solution? Your current code will be replaced."))return;l(V[u]),D(!0)}},[A,z,y,r,u]),te=s.useCallback(()=>{if(k(),a.current){try{a.current.unmount()}catch{}a.current=null}i.current=[],f([]),E(!1)},[k]),ne=s.useCallback(()=>{v(!0),x(""),B("all"),P("all"),setTimeout(()=>{var t;return(t=j.current)==null?void 0:t.focus()},200)},[]),F=s.useCallback(()=>{v(!1)},[]),se=s.useCallback(t=>{if(t.key==="Tab"){t.preventDefault();const n=t.target,c=n.selectionStart,m=n.selectionEnd;l(r.substring(0,c)+"  "+r.substring(m)),setTimeout(()=>{n.selectionStart=n.selectionEnd=c+2},0)}},[r]);return e.jsxs("div",{className:"flex flex-col h-[calc(100vh-3.5rem)] md:h-screen relative",children:[e.jsx(be,{children:T&&e.jsxs(e.Fragment,{children:[e.jsx(G.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 bg-black/60 backdrop-blur-sm z-30",onClick:F}),e.jsxs(G.div,{initial:{opacity:0,scale:.97,y:8},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.97,y:8},transition:{type:"spring",damping:26,stiffness:320},className:"fixed inset-0 m-auto w-[min(960px,94vw)] h-[min(620px,88vh)] bg-white dark:bg-[#0f0f1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-40 flex flex-col overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20",children:e.jsx(q,{size:16,className:"text-white"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"font-bold text-base leading-tight",children:"Templates"}),e.jsxs("span",{className:"text-[11px] text-slate-400",children:[S.length," snippets across ",N.length," categories"]})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-[260px]",children:[e.jsx(J,{size:13,className:"text-slate-400 shrink-0"}),e.jsx("input",{ref:j,value:b,onChange:t=>x(t.target.value),onKeyDown:t=>t.key==="Escape"&&F(),placeholder:"Search templates...",className:"flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"}),b&&e.jsx("button",{onClick:()=>{var t;x(""),(t=j.current)==null||t.focus()},className:"text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors",children:e.jsx(W,{size:13})})]}),e.jsx("button",{onClick:F,className:"p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",children:e.jsx(W,{size:16})})]})]}),e.jsxs("div",{className:"flex-1 flex min-h-0",children:[e.jsxs("div",{className:"w-[220px] shrink-0 border-r border-slate-100 dark:border-slate-800 py-3 overflow-y-auto sidebar-scroll bg-slate-50/60 dark:bg-slate-900/40",children:[e.jsx("div",{className:"px-3 pb-3 flex gap-1.5 flex-wrap",children:_.map(t=>{const n=t==="all"?S.length:S.filter(c=>c.tag.toLowerCase()===t).length;return e.jsxs("button",{onClick:()=>B(t),className:["px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize flex items-center gap-1",C===t?"bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300":"bg-white dark:bg-slate-800/70 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"].join(" "),children:[t==="all"?"All":t,e.jsx("span",{className:"text-[9px] opacity-60",children:n})]},t)})}),e.jsxs("div",{className:"px-2",children:[e.jsxs("button",{onClick:()=>P("all"),className:["w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between",w==="all"?"bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium":"text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"].join(" "),children:[e.jsx("span",{children:"All categories"}),e.jsx("span",{className:"text-[10px] text-slate-400",children:h.reduce((t,n)=>t+n.templates.length,0)})]}),h.map(t=>{const n=w===t.label;return e.jsxs("button",{onClick:()=>P(t.label),className:["w-full text-left px-3 py-2 mt-0.5 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2",n?"bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium":"text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"].join(" "),children:[e.jsxs("span",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("span",{className:["text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",t.tag==="React"?"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400":t.tag==="Polyfills"?"bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400":"bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"].join(" "),children:t.tag}),e.jsx("span",{className:"truncate",children:t.label})]}),e.jsx("span",{className:"text-[10px] text-slate-400 shrink-0",children:t.templates.length})]},t.label)})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto sidebar-scroll p-4",children:[e.jsxs("div",{className:"sm:hidden mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700",children:[e.jsx(J,{size:13,className:"text-slate-400 shrink-0"}),e.jsx("input",{value:b,onChange:t=>x(t.target.value),placeholder:"Search templates...",className:"flex-1 bg-transparent outline-none text-sm"})]}),h.length===0?e.jsxs("div",{className:"h-full flex flex-col items-center justify-center py-12 text-slate-400",children:[e.jsx(J,{size:32,className:"mb-3 opacity-40"}),e.jsx("p",{className:"text-sm font-medium",children:"No templates found"}),e.jsx("p",{className:"text-xs mt-1",children:"Try a different search or filter"})]}):(w==="all"?h:h.filter(t=>t.label===w)).map(t=>e.jsxs("div",{className:"mb-5 last:mb-0",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2.5",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",children:t.label}),e.jsx("span",{className:["text-[9px] px-1.5 py-0.5 rounded-full font-semibold",t.tag==="React"?"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400":t.tag==="Polyfills"?"bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400":"bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"].join(" "),children:t.tag})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2",children:t.templates.map(n=>{const c=u===n.name;return e.jsxs("button",{onClick:()=>Q(n),className:["text-left px-3 py-2.5 rounded-xl text-[13px] transition-all flex items-center gap-2 group border",c?"bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm":"bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300"].join(" "),children:[e.jsx("span",{className:"flex-1 truncate",children:n.name}),n.jsx&&e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 shrink-0",children:"JSX"}),e.jsx(ue,{size:12,className:"text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0"})]},n.name)})})]},t.label))]})]}),e.jsxs("div",{className:"px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between",children:[e.jsxs("p",{className:"text-[11px] text-slate-400",children:[h.reduce((t,n)=>t+n.templates.length,0)," matching"]}),e.jsxs("p",{className:"text-[11px] text-slate-400",children:["Press ",e.jsx("kbd",{className:"px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono mx-0.5",children:"Esc"})," to close"]})]})]})]})}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 border-b border-[#2d333b] bg-[#1c2028] shrink-0 text-slate-200",children:[e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsx("button",{onClick:()=>window.dispatchEvent(new Event("prephub:show-sidebar")),className:"text-slate-400 hover:text-white transition-colors shrink-0 hidden md:flex p-1.5 rounded-lg hover:bg-[#2d333b]",title:"Show sidebar",children:e.jsx(pe,{size:16})}),e.jsx(ce,{to:"/",className:"text-slate-400 hover:text-white transition-colors shrink-0",title:"Back to home",children:e.jsx(me,{size:18})}),e.jsx("h1",{className:"text-lg font-bold shrink-0 text-white",children:"Playground"}),u&&e.jsxs("span",{className:"text-sm text-slate-500 font-normal truncate hidden sm:inline",children:["— ",u]}),U&&e.jsx("span",{className:"text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 font-semibold shrink-0",children:"React"})]}),e.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsxs("button",{onClick:ne,className:"flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white transition-colors",children:[e.jsx(q,{size:14})," Templates"]}),z&&e.jsxs("button",{onClick:ee,className:"flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors "+(y?"border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20":"border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white"),title:y?"Switch back to the challenge":"Reveal the solution",children:[e.jsx(ge,{size:14}),y?"Hide Solution":"Show Solution"]}),e.jsx("button",{onClick:te,className:"p-2 rounded-xl border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors",title:"Clear output",children:e.jsx(fe,{size:16})}),e.jsxs("button",{onClick:M,disabled:I,className:"flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm",children:[I?e.jsx(he,{size:14,className:"animate-spin"}):e.jsx(ye,{size:14}),I?"Running...":"Run"]})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col md:flex-row min-h-0",children:[e.jsxs("div",{className:"flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-[#2d333b]",children:[e.jsxs("div",{className:"px-4 py-2 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center justify-between",children:[e.jsx("span",{children:U?"React JSX":"JavaScript"}),e.jsxs("span",{className:"text-slate-600",children:[r.split(`
`).length," lines"]})]}),e.jsx("textarea",{ref:Z,value:r,onChange:t=>l(t.target.value),onKeyDown:se,className:"flex-1 p-4 font-mono text-sm leading-relaxed bg-[#1e1e2e] text-[#cdd6f4] resize-none outline-none min-h-[200px]",spellCheck:!1,autoCapitalize:"off",autoCorrect:"off",placeholder:"Write your JavaScript or React code here..."})]}),e.jsx(ve,{output:R,hasPreview:X,previewRef:L})]})]})}export{Re as default};
