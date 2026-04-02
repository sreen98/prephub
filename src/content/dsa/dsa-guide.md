# Data Structures & Algorithms — Complete Guide

A comprehensive guide to data structures, algorithms, and problem-solving patterns for coding interviews. All examples are in JavaScript.

---

## Table of Contents

- [1. Big-O Notation](#1-big-o-notation)
- [2. Arrays & Strings](#2-arrays--strings)
- [3. Hash Maps & Sets](#3-hash-maps--sets)
- [4. Linked Lists](#4-linked-lists)
- [5. Stacks & Queues](#5-stacks--queues)
- [6. Trees](#6-trees)
- [7. Graphs](#7-graphs)
- [8. Sorting](#8-sorting)
- [9. Searching](#9-searching)
- [10. Dynamic Programming](#10-dynamic-programming)
- [11. Common Patterns Summary](#11-common-patterns-summary)
- [12. Interview Questions & Answers](#12-interview-questions--answers)
- [References](#references)

---

## 1. Big-O Notation

Big-O notation describes the upper bound of an algorithm's growth rate as the input size increases. It tells you how an algorithm **scales**, not how fast it runs in absolute time. Interviewers expect you to analyze time and space complexity for every solution you write.

### 1.1 Time Complexity

Time complexity measures how the number of operations grows relative to the input size `n`.

```js
// O(1) — Constant: same time regardless of input size
function getFirst(arr) {
  return arr[0]; // single operation, no matter how big arr is
}
console.log(getFirst([10, 20, 30])); // 10

// O(log n) — Logarithmic: halves the input each step (e.g., binary search)
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
console.log(binarySearch([1, 3, 5, 7, 9], 7)); // 3

// O(n) — Linear: visits every element once
function findMax(arr) {
  let max = -Infinity;
  for (const num of arr) {
    if (num > max) max = num; // runs n times
  }
  return max;
}
console.log(findMax([3, 1, 4, 1, 5, 9])); // 9

// O(n log n) — Linearithmic: typical of efficient sorting (merge sort, quick sort avg)
// See Section 8 for full implementations

// O(n^2) — Quadratic: nested loops over the input
function hasDuplicateBrute(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true; // compare every pair
    }
  }
  return false;
}
console.log(hasDuplicateBrute([1, 2, 3, 2])); // true

// O(2^n) — Exponential: doubles work with each additional input element
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2); // two recursive calls per level
}
console.log(fibNaive(10)); // 55
```

### 1.2 Space Complexity

Space complexity measures the additional memory an algorithm uses relative to input size, excluding the input itself.

```js
// O(1) space — uses a fixed number of variables
function sum(arr) {
  let total = 0; // only one extra variable
  for (const num of arr) total += num;
  return total;
}
console.log(sum([1, 2, 3, 4])); // 10

// O(n) space — creates a data structure proportional to input
function doubleAll(arr) {
  const result = []; // new array grows with input
  for (const num of arr) result.push(num * 2);
  return result;
}
console.log(doubleAll([1, 2, 3])); // [2, 4, 6]

// O(n) space — recursive call stack
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // n stack frames
}
console.log(factorial(5)); // 120
```

### 1.3 Common Complexities

```
| Complexity | Name          | Example                                  |
|------------|---------------|------------------------------------------|
| O(1)       | Constant      | Array access, hash map lookup             |
| O(log n)   | Logarithmic   | Binary search                             |
| O(n)       | Linear        | Single loop through array                 |
| O(n log n) | Linearithmic  | Merge sort, quick sort (average)          |
| O(n^2)     | Quadratic     | Nested loops, bubble sort                 |
| O(2^n)     | Exponential   | Recursive subsets, naive fibonacci         |
| O(n!)      | Factorial     | Permutations                              |
```

**Rule of thumb for interviews**: If `n <= 20`, O(2^n) is fine. If `n <= 1000`, O(n^2) may work. If `n <= 10^6`, you need O(n log n) or better. If `n <= 10^8`, you need O(n) or O(log n).

---

## 2. Arrays & Strings

Arrays and strings are the most common data structures in interviews. Most problems involve iterating, comparing, or rearranging elements using well-known patterns.

### 2.1 Two Pointers

The two-pointer technique uses two indices that move toward each other (or in the same direction) to reduce a nested loop to a single pass. Typically used on **sorted** arrays or when working from both ends.

```js
// Pair with target sum in a sorted array — O(n) time, O(1) space
function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;   // need a bigger sum
    else right--;                     // need a smaller sum
  }
  return [-1, -1]; // no pair found
}
console.log(twoSumSorted([1, 2, 3, 4, 6], 6)); // [1, 3] (2 + 4 = 6)

// Remove duplicates from sorted array in-place — O(n) time, O(1) space
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0; // slow pointer tracks the last unique element
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast]; // overwrite the next position with the unique value
    }
  }
  return slow + 1; // length of unique portion
}
const arr1 = [1, 1, 2, 3, 3, 4];
console.log(removeDuplicates(arr1)); // 4 (arr1 is now [1, 2, 3, 4, ...])
```

### 2.2 Sliding Window

The sliding window pattern maintains a "window" of elements as you iterate through an array or string. Expand the window to include more elements, and shrink it when a condition is violated. Ideal for subarray/substring problems.

```js
// Maximum sum of a subarray of size k — O(n) time, O(1) space
function maxSubarraySum(arr, k) {
  if (arr.length < k) return null;
  let windowSum = 0;
  // Build the first window
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;
  // Slide the window: add the next element, remove the first element of previous window
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
console.log(maxSubarraySum([2, 1, 5, 1, 3, 2], 3)); // 9 (subarray [5, 1, 3])

// Longest substring without repeating characters — O(n) time, O(min(n, charset)) space
function lengthOfLongestSubstring(s) {
  const seen = new Map(); // char -> most recent index
  let maxLen = 0, start = 0;
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (seen.has(ch) && seen.get(ch) >= start) {
      start = seen.get(ch) + 1; // shrink window past the duplicate
    }
    seen.set(ch, end);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}
console.log(lengthOfLongestSubstring("abcabcbb")); // 3 ("abc")
console.log(lengthOfLongestSubstring("bbbbb"));    // 1 ("b")
```

### 2.3 Prefix Sum

A prefix sum array stores cumulative sums so that the sum of any subarray `[i, j]` can be computed in O(1) after O(n) preprocessing.

```js
// Build prefix sum and query range sums — O(n) build, O(1) per query
function buildPrefixSum(arr) {
  const prefix = [0]; // prefix[0] = 0 for easier range calculation
  for (let i = 0; i < arr.length; i++) {
    prefix.push(prefix[i] + arr[i]);
  }
  return prefix;
}

function rangeSum(prefix, i, j) {
  // Sum of arr[i..j] = prefix[j+1] - prefix[i]
  return prefix[j + 1] - prefix[i];
}

const prefix = buildPrefixSum([1, 2, 3, 4, 5]);
console.log(rangeSum(prefix, 1, 3)); // 9 (2 + 3 + 4)
console.log(rangeSum(prefix, 0, 4)); // 15 (1 + 2 + 3 + 4 + 5)

// Subarray sum equals k — count subarrays whose sum equals k — O(n) time, O(n) space
function subarraySum(nums, k) {
  const prefixCount = new Map(); // prefix sum -> frequency
  prefixCount.set(0, 1);         // empty prefix has sum 0
  let sum = 0, count = 0;
  for (const num of nums) {
    sum += num;
    // If (sum - k) was seen before, those subarrays ending here sum to k
    if (prefixCount.has(sum - k)) {
      count += prefixCount.get(sum - k);
    }
    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
  }
  return count;
}
console.log(subarraySum([1, 1, 1], 2));       // 2
console.log(subarraySum([1, 2, 3, -1, 2], 4)); // 3
```

### 2.4 Common Problems

```js
// Reverse a string — O(n) time, O(n) space (strings are immutable in JS)
function reverseString(s) {
  return s.split('').reverse().join('');
}
console.log(reverseString("hello")); // "olleh"

// In-place reverse of a char array — O(n) time, O(1) space
function reverseArray(chars) {
  let left = 0, right = chars.length - 1;
  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]]; // swap
    left++;
    right--;
  }
  return chars;
}
console.log(reverseArray(["h", "e", "l", "l", "o"])); // ["o", "l", "l", "e", "h"]

// Check palindrome — O(n) time, O(1) space
function isPalindrome(s) {
  // Remove non-alphanumeric and lowercase
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                      // false

// Check anagram — O(n) time, O(1) space (fixed charset)
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of t) {
    if (!freq[ch]) return false;
    freq[ch]--;
  }
  return true;
}
console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));          // false

// Two Sum (unsorted) — O(n) time, O(n) space
function twoSum(nums, target) {
  const map = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
```

---

## 3. Hash Maps & Sets

Hash maps (objects, `Map`) and sets (`Set`) provide O(1) average-time lookups, inserts, and deletes. They are the go-to data structure when you need to trade space for speed.

### 3.1 Frequency Counter Pattern

Count occurrences of elements to compare distributions, detect duplicates, or find the most/least frequent item.

```js
// Character frequency counter — O(n) time, O(k) space where k = unique chars
function charFrequency(str) {
  const freq = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}
console.log(charFrequency("banana")); // { b: 1, a: 3, n: 2 }

// Find the first non-repeating character — O(n) time, O(1) space (26 letters)
function firstUniqChar(s) {
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  for (let i = 0; i < s.length; i++) {
    if (freq[s[i]] === 1) return i;
  }
  return -1;
}
console.log(firstUniqChar("leetcode"));   // 0 ('l')
console.log(firstUniqChar("loveleetcode")); // 2 ('v')

// Check if two arrays have the same frequency of elements — O(n) time
function sameFrequency(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const freq = new Map();
  for (const val of arr1) freq.set(val, (freq.get(val) || 0) + 1);
  for (const val of arr2) {
    if (!freq.get(val)) return false;
    freq.set(val, freq.get(val) - 1);
  }
  return true;
}
console.log(sameFrequency([1, 2, 3, 2], [2, 1, 2, 3])); // true
console.log(sameFrequency([1, 2, 3], [1, 2, 4]));         // false
```

### 3.2 Two Sum with Hash Map

The classic interview problem: find two numbers in an array that add up to a target. Using a hash map reduces time from O(n^2) to O(n).

```js
// Two Sum — O(n) time, O(n) space
function twoSum(nums, target) {
  const map = new Map(); // stores value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i]; // found the pair
    }
    map.set(nums[i], i); // store current value for future lookups
  }
  return []; // no pair found
}
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 3], 6));           // [0, 1]

// Contains duplicate — O(n) time, O(n) space using Set
function containsDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true; // O(1) lookup
    seen.add(num);
  }
  return false;
}
console.log(containsDuplicate([1, 2, 3, 1])); // true
console.log(containsDuplicate([1, 2, 3, 4])); // false
```

### 3.3 Grouping & Lookup

Hash maps are powerful for grouping items by a key or building quick lookup tables.

```js
// Group anagrams — O(n * k log k) time where k = max string length
function groupAnagrams(strs) {
  const map = new Map();
  for (const str of strs) {
    const key = str.split('').sort().join(''); // sorted chars as key
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(str);
  }
  return Array.from(map.values());
}
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [["eat","tea","ate"], ["tan","nat"], ["bat"]]

// Intersection of two arrays — O(n + m) time
function intersection(nums1, nums2) {
  const set1 = new Set(nums1);
  const result = new Set();
  for (const num of nums2) {
    if (set1.has(num)) result.add(num);
  }
  return Array.from(result);
}
console.log(intersection([1, 2, 2, 1], [2, 2]));    // [2]
console.log(intersection([4, 9, 5], [9, 4, 9, 8])); // [9, 4]

// Word pattern — check if string follows a pattern — O(n) time
function wordPattern(pattern, s) {
  const words = s.split(' ');
  if (pattern.length !== words.length) return false;
  const charToWord = new Map();
  const wordToChar = new Map();
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i], word = words[i];
    if (charToWord.has(ch) && charToWord.get(ch) !== word) return false;
    if (wordToChar.has(word) && wordToChar.get(word) !== ch) return false;
    charToWord.set(ch, word);
    wordToChar.set(word, ch);
  }
  return true;
}
console.log(wordPattern("abba", "dog cat cat dog")); // true
console.log(wordPattern("abba", "dog cat cat fish")); // false
```

---

## 4. Linked Lists

A linked list is a linear data structure where each element (node) contains a value and a pointer to the next node. Unlike arrays, linked lists do not have contiguous memory or O(1) random access, but they support O(1) insertion/deletion at the head.

### 4.1 Singly Linked List Implementation

```js
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Add to the front — O(1)
  prepend(val) {
    this.head = new ListNode(val, this.head);
    this.size++;
  }

  // Add to the end — O(n)
  append(val) {
    const node = new ListNode(val);
    if (!this.head) {
      this.head = node;
    } else {
      let curr = this.head;
      while (curr.next) curr = curr.next;
      curr.next = node;
    }
    this.size++;
  }

  // Delete first occurrence of val — O(n)
  delete(val) {
    if (!this.head) return false;
    if (this.head.val === val) {
      this.head = this.head.next;
      this.size--;
      return true;
    }
    let curr = this.head;
    while (curr.next) {
      if (curr.next.val === val) {
        curr.next = curr.next.next;
        this.size--;
        return true;
      }
      curr = curr.next;
    }
    return false;
  }

  // Search — O(n)
  find(val) {
    let curr = this.head;
    while (curr) {
      if (curr.val === val) return curr;
      curr = curr.next;
    }
    return null;
  }

  // Convert to array for display — O(n)
  toArray() {
    const result = [];
    let curr = this.head;
    while (curr) {
      result.push(curr.val);
      curr = curr.next;
    }
    return result;
  }
}

// Test
const list = new SinglyLinkedList();
list.append(1);
list.append(2);
list.append(3);
list.prepend(0);
console.log(list.toArray()); // [0, 1, 2, 3]
list.delete(2);
console.log(list.toArray()); // [0, 1, 3]
console.log(list.find(3));   // ListNode { val: 3, next: null }
console.log(list.size);      // 3
```

### 4.2 Common Operations

```js
// Helper: build a linked list from an array
function buildList(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) {
    head = new ListNode(arr[i], head);
  }
  return head;
}

// Helper: linked list to array (for display)
function toArray(head) {
  const result = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}

// Reverse a linked list — O(n) time, O(1) space
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next; // save next
    curr.next = prev;       // reverse the pointer
    prev = curr;            // advance prev
    curr = next;            // advance curr
  }
  return prev; // prev is the new head
}

let head = buildList([1, 2, 3, 4, 5]);
console.log(toArray(reverseList(head))); // [5, 4, 3, 2, 1]

// Detect cycle (Floyd's tortoise and hare) — O(n) time, O(1) space
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;       // moves 1 step
    fast = fast.next.next;  // moves 2 steps
    if (slow === fast) return true; // they meet -> cycle exists
  }
  return false; // fast reached the end -> no cycle
}

// Test cycle detection
const node1 = new ListNode(1);
const node2 = new ListNode(2);
const node3 = new ListNode(3);
node1.next = node2;
node2.next = node3;
node3.next = node2; // cycle: 3 -> 2
console.log(hasCycle(node1)); // true
console.log(hasCycle(buildList([1, 2, 3]))); // false

// Find middle node — O(n) time, O(1) space
function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;       // moves 1 step
    fast = fast.next.next;  // moves 2 steps
  }
  return slow; // when fast reaches end, slow is at middle
}

console.log(findMiddle(buildList([1, 2, 3, 4, 5])).val); // 3
console.log(findMiddle(buildList([1, 2, 3, 4])).val);     // 3 (second middle)

// Merge two sorted linked lists — O(n + m) time, O(1) space
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0); // dummy head simplifies edge cases
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }
  curr.next = l1 || l2; // attach remaining nodes
  return dummy.next;
}

const list1 = buildList([1, 3, 5]);
const list2 = buildList([2, 4, 6]);
console.log(toArray(mergeTwoLists(list1, list2))); // [1, 2, 3, 4, 5, 6]
```

---

## 5. Stacks & Queues

A **stack** is a Last-In-First-Out (LIFO) structure, and a **queue** is a First-In-First-Out (FIFO) structure. Both are fundamental building blocks for more complex algorithms.

### 5.1 Stack Implementation & Use Cases

```js
// Stack using an array — all operations O(1)
class Stack {
  constructor() {
    this.items = [];
  }
  push(val) { this.items.push(val); }
  pop() { return this.items.pop(); }          // returns undefined if empty
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.peek()); // 3
console.log(stack.pop());  // 3
console.log(stack.size()); // 2
```

### 5.2 Queue Implementation

```js
// Queue using a linked list — all operations O(1)
class Queue {
  constructor() {
    this.head = null; // front of queue (dequeue from here)
    this.tail = null; // back of queue (enqueue here)
    this.length = 0;
  }

  enqueue(val) {
    const node = new ListNode(val);
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node; // first element
    }
    this.tail = node;
    this.length++;
  }

  dequeue() {
    if (!this.head) return undefined;
    const val = this.head.val;
    this.head = this.head.next;
    if (!this.head) this.tail = null; // queue is now empty
    this.length--;
    return val;
  }

  peek() { return this.head ? this.head.val : undefined; }
  isEmpty() { return this.length === 0; }
  size() { return this.length; }
}

const queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
console.log(queue.dequeue()); // 1
console.log(queue.peek());    // 2
console.log(queue.size());    // 2
```

### 5.3 Common Problems

```js
// Valid Parentheses — O(n) time, O(n) space
function isValid(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch); // push opening brackets
    } else {
      if (stack.pop() !== map[ch]) return false; // must match the last opening
    }
  }
  return stack.length === 0; // all brackets must be closed
}
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false
console.log(isValid("([)]"));   // false
console.log(isValid("{[]}"));   // true

// Min Stack — push, pop, top, getMin all in O(1)
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = []; // tracks the minimum at each level
  }

  push(val) {
    this.stack.push(val);
    // Push to minStack if it's empty or val is <= current min
    const currentMin = this.minStack.length
      ? this.minStack[this.minStack.length - 1]
      : Infinity;
    this.minStack.push(Math.min(val, currentMin));
  }

  pop() {
    this.stack.pop();
    this.minStack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}

const ms = new MinStack();
ms.push(-2);
ms.push(0);
ms.push(-3);
console.log(ms.getMin()); // -3
ms.pop();
console.log(ms.top());    // 0
console.log(ms.getMin()); // -2

// Implement Queue using Two Stacks — amortized O(1) per operation
class QueueWithStacks {
  constructor() {
    this.inStack = [];  // for enqueue
    this.outStack = []; // for dequeue
  }

  enqueue(val) {
    this.inStack.push(val);
  }

  dequeue() {
    if (this.outStack.length === 0) {
      // Transfer all elements from inStack to outStack (reverses order)
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
    return this.outStack.pop();
  }

  peek() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
    return this.outStack[this.outStack.length - 1];
  }

  isEmpty() {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
}

const q = new QueueWithStacks();
q.enqueue(1);
q.enqueue(2);
q.enqueue(3);
console.log(q.dequeue()); // 1
console.log(q.peek());    // 2
console.log(q.dequeue()); // 2
```

---

## 6. Trees

A tree is a hierarchical data structure with a root node and child nodes forming a parent-child relationship. Trees are one of the most heavily tested topics in coding interviews.

### 6.1 Binary Tree (BFS, DFS)

A binary tree is a tree where each node has at most two children (left and right). There are two main traversal strategies: Breadth-First Search (BFS, level by level) and Depth-First Search (DFS, as deep as possible first).

```js
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Build a sample tree:
//        1
//       / \
//      2   3
//     / \   \
//    4   5   6
const tree = new TreeNode(1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(6))
);

// BFS (Level Order) — uses a queue — O(n) time, O(n) space
function bfs(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift(); // dequeue front
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}
console.log(bfs(tree)); // [1, 2, 3, 4, 5, 6]

// DFS — Inorder (Left, Root, Right) — used for BST sorted traversal
function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);       // visit root between children
  inorder(root.right, result);
  return result;
}
console.log(inorder(tree)); // [4, 2, 5, 1, 3, 6]

// DFS — Preorder (Root, Left, Right) — used to serialize/copy a tree
function preorder(root, result = []) {
  if (!root) return result;
  result.push(root.val);       // visit root first
  preorder(root.left, result);
  preorder(root.right, result);
  return result;
}
console.log(preorder(tree)); // [1, 2, 4, 5, 3, 6]

// DFS — Postorder (Left, Right, Root) — used for deletion/cleanup
function postorder(root, result = []) {
  if (!root) return result;
  postorder(root.left, result);
  postorder(root.right, result);
  result.push(root.val);       // visit root last
  return result;
}
console.log(postorder(tree)); // [4, 5, 2, 6, 3, 1]

// Iterative Inorder using a stack — O(n) time, O(h) space
function inorderIterative(root) {
  const result = [], stack = [];
  let curr = root;
  while (curr || stack.length > 0) {
    while (curr) {
      stack.push(curr);  // go as far left as possible
      curr = curr.left;
    }
    curr = stack.pop();    // backtrack
    result.push(curr.val); // visit node
    curr = curr.right;     // go right
  }
  return result;
}
console.log(inorderIterative(tree)); // [4, 2, 5, 1, 3, 6]
```

### 6.2 Binary Search Tree (BST)

A BST is a binary tree where for each node, all values in its left subtree are less and all values in its right subtree are greater. This property enables O(log n) search, insert, and delete on average (O(n) worst case for skewed trees).

```js
// Insert into BST — O(h) time
function insertBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertBST(root.left, val);
  else root.right = insertBST(root.right, val);
  return root;
}

// Build BST from array
let bst = null;
for (const val of [5, 3, 7, 1, 4, 6, 8]) {
  bst = insertBST(bst, val);
}
//        5
//       / \
//      3   7
//     / \ / \
//    1  4 6  8
console.log(inorder(bst)); // [1, 3, 4, 5, 6, 7, 8] — sorted!

// Search in BST — O(h) time
function searchBST(root, val) {
  if (!root || root.val === val) return root;
  if (val < root.val) return searchBST(root.left, val);
  return searchBST(root.right, val);
}
console.log(searchBST(bst, 4)?.val);  // 4
console.log(searchBST(bst, 10));       // null

// Delete from BST — O(h) time
function deleteBST(root, val) {
  if (!root) return null;
  if (val < root.val) {
    root.left = deleteBST(root.left, val);
  } else if (val > root.val) {
    root.right = deleteBST(root.right, val);
  } else {
    // Found the node to delete
    if (!root.left) return root.right;   // no left child
    if (!root.right) return root.left;   // no right child
    // Two children: replace with inorder successor (smallest in right subtree)
    let successor = root.right;
    while (successor.left) successor = successor.left;
    root.val = successor.val;
    root.right = deleteBST(root.right, successor.val);
  }
  return root;
}

bst = deleteBST(bst, 3);
console.log(inorder(bst)); // [1, 4, 5, 6, 7, 8]

// Validate BST — O(n) time, O(h) space
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  // Left subtree must be < root, right subtree must be > root
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}
console.log(isValidBST(bst)); // true
```

### 6.3 Common Problems

```js
// Maximum depth of a binary tree — O(n) time, O(h) space
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
console.log(maxDepth(tree)); // 3

// Level Order Traversal (return array of levels) — O(n) time, O(n) space
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
console.log(levelOrder(tree)); // [[1], [2, 3], [4, 5, 6]]

// Lowest Common Ancestor of a Binary Tree — O(n) time, O(h) space
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root; // p and q are in different subtrees
  return left || right;           // both are in the same subtree
}

// Using the tree from 6.1
const nodeP = tree.left.left;  // node 4
const nodeQ = tree.left.right; // node 5
console.log(lowestCommonAncestor(tree, nodeP, nodeQ).val); // 2

// Invert a binary tree — O(n) time, O(h) space
function invertTree(root) {
  if (!root) return null;
  // Swap left and right children
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}

// Build fresh tree to invert
const treeToInvert = new TreeNode(1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3)
);
invertTree(treeToInvert);
console.log(bfs(treeToInvert)); // [1, 3, 2, 5, 4]
```

---

## 7. Graphs

A graph consists of vertices (nodes) and edges (connections between nodes). Graphs can be directed or undirected, weighted or unweighted, and cyclic or acyclic. Many real-world problems -- social networks, maps, dependencies -- are graph problems.

### 7.1 Representation

```js
// Adjacency List — most common, space-efficient for sparse graphs
// O(V + E) space
const adjList = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'D'],
  D: ['B', 'C'],
};

// Using Map for flexibility
function buildAdjList(edges, directed = false) {
  const graph = new Map();
  for (const [u, v] of edges) {
    if (!graph.has(u)) graph.set(u, []);
    if (!graph.has(v)) graph.set(v, []);
    graph.get(u).push(v);
    if (!directed) graph.get(v).push(u); // undirected: add both directions
  }
  return graph;
}

const graph = buildAdjList([['A','B'], ['A','C'], ['B','D'], ['C','D']]);
console.log(graph);
// Map { 'A' => ['B','C'], 'B' => ['A','D'], 'C' => ['A','D'], 'D' => ['B','C'] }

// Adjacency Matrix — good for dense graphs, O(1) edge lookup
// O(V^2) space
function buildAdjMatrix(n, edges, directed = false) {
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (const [u, v] of edges) {
    matrix[u][v] = 1;
    if (!directed) matrix[v][u] = 1;
  }
  return matrix;
}

const matrix = buildAdjMatrix(4, [[0,1], [0,2], [1,3], [2,3]]);
console.log(matrix);
// [[0,1,1,0], [1,0,0,1], [1,0,0,1], [0,1,1,0]]
```

### 7.2 BFS and DFS on Graphs

```js
// BFS on a graph — O(V + E) time, O(V) space
function graphBFS(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of (graph.get(node) || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

const g = buildAdjList([['A','B'], ['A','C'], ['B','D'], ['C','D'], ['D','E']]);
console.log(graphBFS(g, 'A')); // ['A', 'B', 'C', 'D', 'E']

// DFS on a graph (iterative) — O(V + E) time, O(V) space
function graphDFS(graph, start) {
  const visited = new Set();
  const stack = [start];
  const order = [];
  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    // Push neighbors in reverse for consistent left-to-right order
    const neighbors = graph.get(node) || [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      if (!visited.has(neighbors[i])) {
        stack.push(neighbors[i]);
      }
    }
  }
  return order;
}
console.log(graphDFS(g, 'A')); // ['A', 'B', 'D', 'C', 'E'] (order may vary)

// DFS on a graph (recursive) — O(V + E) time, O(V) space
function graphDFSRecursive(graph, node, visited = new Set(), order = []) {
  if (visited.has(node)) return order;
  visited.add(node);
  order.push(node);
  for (const neighbor of (graph.get(node) || [])) {
    graphDFSRecursive(graph, neighbor, visited, order);
  }
  return order;
}
console.log(graphDFSRecursive(g, 'A')); // ['A', 'B', 'D', 'C', 'E']
```

### 7.3 Common Problems

```js
// Number of Islands — O(rows * cols) time and space
function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    // Boundary check and water/visited check
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') return;
    grid[r][c] = '0'; // mark as visited by sinking the island
    dfs(r + 1, c);    // down
    dfs(r - 1, c);    // up
    dfs(r, c + 1);    // right
    dfs(r, c - 1);    // left
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;     // found a new island
        dfs(r, c);   // sink the entire island
      }
    }
  }
  return count;
}

const grid = [
  ['1','1','0','0','0'],
  ['1','1','0','0','0'],
  ['0','0','1','0','0'],
  ['0','0','0','1','1'],
];
console.log(numIslands(grid)); // 3

// Course Schedule (Topological Sort — detect cycle in directed graph)
// O(V + E) time, O(V + E) space
function canFinish(numCourses, prerequisites) {
  // Build adjacency list and in-degree array
  const graph = new Map();
  const inDegree = new Array(numCourses).fill(0);

  for (let i = 0; i < numCourses; i++) graph.set(i, []);
  for (const [course, prereq] of prerequisites) {
    graph.get(prereq).push(course);
    inDegree[course]++;
  }

  // Kahn's algorithm: start with nodes having in-degree 0
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let completed = 0;
  while (queue.length > 0) {
    const course = queue.shift();
    completed++;
    for (const next of graph.get(course)) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next); // all prereqs met
    }
  }
  return completed === numCourses; // true if no cycle
}
console.log(canFinish(4, [[1,0],[2,0],[3,1],[3,2]])); // true
console.log(canFinish(2, [[0,1],[1,0]]));               // false (cycle)

// Topological Sort — return a valid ordering
function topologicalSort(numCourses, prerequisites) {
  const graph = new Map();
  const inDegree = new Array(numCourses).fill(0);

  for (let i = 0; i < numCourses; i++) graph.set(i, []);
  for (const [course, prereq] of prerequisites) {
    graph.get(prereq).push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order = [];
  while (queue.length > 0) {
    const course = queue.shift();
    order.push(course);
    for (const next of graph.get(course)) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return order.length === numCourses ? order : []; // empty if cycle exists
}
console.log(topologicalSort(4, [[1,0],[2,0],[3,1],[3,2]])); // [0, 1, 2, 3]
```

---

## 8. Sorting

Sorting is fundamental to computer science and a frequent interview topic. Understanding the trade-offs between different sorting algorithms is essential.

### 8.1 Bubble Sort, Selection Sort, Insertion Sort

These are simple O(n^2) algorithms. They are rarely used in production but are important to understand conceptually and are common interview questions.

```js
// Bubble Sort — O(n^2) time, O(1) space
// Repeatedly swap adjacent elements if they are in the wrong order
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // swap
        swapped = true;
      }
    }
    if (!swapped) break; // already sorted — early exit
  }
  return arr;
}
console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90])); // [11, 12, 22, 25, 34, 64, 90]

// Selection Sort — O(n^2) time, O(1) space
// Find the minimum element and place it at the beginning
function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; // swap with minimum
    }
  }
  return arr;
}
console.log(selectionSort([64, 25, 12, 22, 11])); // [11, 12, 22, 25, 64]

// Insertion Sort — O(n^2) worst, O(n) best (nearly sorted), O(1) space
// Build sorted portion from left to right by inserting each element
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]; // shift elements right
      j--;
    }
    arr[j + 1] = key; // insert at correct position
  }
  return arr;
}
console.log(insertionSort([12, 11, 13, 5, 6])); // [5, 6, 11, 12, 13]
```

### 8.2 Merge Sort

Merge sort is a divide-and-conquer algorithm that splits the array in half, recursively sorts each half, then merges them. It guarantees O(n log n) time but uses O(n) extra space.

```js
// Merge Sort — O(n log n) time, O(n) space — stable sort
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));   // sort left half
  const right = mergeSort(arr.slice(mid));      // sort right half
  return merge(left, right);                    // merge sorted halves
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  // Compare elements from both arrays and pick the smaller one
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  // Append remaining elements
  return result.concat(left.slice(i), right.slice(j));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10])); // [3, 9, 10, 27, 38, 43, 82]
```

### 8.3 Quick Sort

Quick sort picks a pivot, partitions the array so that elements less than the pivot go left and greater go right, then recursively sorts each partition. Average O(n log n), worst O(n^2) with bad pivots. In-place but not stable.

```js
// Quick Sort — O(n log n) average, O(n^2) worst, O(log n) space (in-place)
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);   // sort left of pivot
    quickSort(arr, pivotIdx + 1, high);  // sort right of pivot
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high]; // choose last element as pivot
  let i = low - 1;         // index of smaller element boundary
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap to left partition
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // place pivot in correct position
  return i + 1;
}

console.log(quickSort([10, 7, 8, 9, 1, 5])); // [1, 5, 7, 8, 9, 10]
```

### 8.4 Comparison Table

```
| Algorithm      | Best       | Average    | Worst      | Space  | Stable |
|----------------|------------|------------|------------|--------|--------|
| Bubble Sort    | O(n)       | O(n^2)     | O(n^2)     | O(1)   | Yes    |
| Selection Sort | O(n^2)     | O(n^2)     | O(n^2)     | O(1)   | No     |
| Insertion Sort | O(n)       | O(n^2)     | O(n^2)     | O(1)   | Yes    |
| Merge Sort     | O(n log n) | O(n log n) | O(n log n) | O(n)   | Yes    |
| Quick Sort     | O(n log n) | O(n log n) | O(n^2)     | O(logn)| No     |
| JS .sort()     | O(n log n) | O(n log n) | O(n log n) | O(logn)| Yes*   |
```

*JavaScript's `Array.prototype.sort()` uses TimSort (hybrid of merge sort and insertion sort) in V8, which is stable as of ES2019.

---

## 9. Searching

### 9.1 Binary Search

Binary search works on **sorted** arrays by repeatedly dividing the search interval in half. It runs in O(log n) time and O(1) space (iterative).

```js
// Standard binary search — O(log n) time, O(1) space
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;       // found
    else if (arr[mid] < target) left = mid + 1; // target is in right half
    else right = mid - 1;                        // target is in left half
  }
  return -1; // not found
}
console.log(binarySearch([1, 3, 5, 7, 9, 11], 7));  // 3
console.log(binarySearch([1, 3, 5, 7, 9, 11], 4));  // -1

// Recursive binary search — O(log n) time, O(log n) space (call stack)
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;
  const mid = Math.floor((left + right) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, right);
  return binarySearchRecursive(arr, target, left, mid - 1);
}
console.log(binarySearchRecursive([2, 4, 6, 8, 10], 6)); // 2
```

### 9.2 Binary Search Variations

```js
// Find first occurrence of target — O(log n)
function findFirst(arr, target) {
  let left = 0, right = arr.length - 1, result = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      result = mid;        // record this position
      right = mid - 1;     // keep searching left for earlier occurrence
    } else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return result;
}
console.log(findFirst([1, 2, 2, 2, 3, 4], 2)); // 1

// Find last occurrence of target — O(log n)
function findLast(arr, target) {
  let left = 0, right = arr.length - 1, result = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      result = mid;        // record this position
      left = mid + 1;      // keep searching right for later occurrence
    } else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return result;
}
console.log(findLast([1, 2, 2, 2, 3, 4], 2)); // 3

// Search in Rotated Sorted Array — O(log n)
// Array was sorted but then rotated: [4,5,6,7,0,1,2]
function searchRotated(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    // Determine which half is sorted
    if (nums[left] <= nums[mid]) {
      // Left half is sorted
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1; // target is in sorted left half
      } else {
        left = mid + 1;  // target is in right half
      }
    } else {
      // Right half is sorted
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;  // target is in sorted right half
      } else {
        right = mid - 1; // target is in left half
      }
    }
  }
  return -1;
}
console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0)); // 4
console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 3)); // -1
console.log(searchRotated([1], 0));                      // -1
```

---

## 10. Dynamic Programming

Dynamic programming (DP) solves problems by breaking them into overlapping subproblems and storing results to avoid redundant computation. There are two approaches: **memoization** (top-down, recursive) and **tabulation** (bottom-up, iterative).

### 10.1 Memoization (Top-Down)

Start from the original problem and recursively break it down. Cache (memoize) results of subproblems so each is solved only once.

```js
// Fibonacci with memoization — O(n) time, O(n) space
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];  // return cached result
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}
console.log(fibMemo(10));  // 55
console.log(fibMemo(50));  // 12586269025 (instant, not exponential)

// Generic memoization wrapper
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

const fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(40)); // 102334155
```

### 10.2 Tabulation (Bottom-Up)

Start from the smallest subproblems and build up to the final answer iteratively. Usually uses an array (the "table") to store intermediate results.

```js
// Fibonacci with tabulation — O(n) time, O(n) space
function fibTab(n) {
  if (n <= 1) return n;
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
console.log(fibTab(10)); // 55

// Fibonacci optimized — O(n) time, O(1) space
function fibOptimized(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
console.log(fibOptimized(10)); // 55
console.log(fibOptimized(50)); // 12586269025
```

### 10.3 Classic Problems

```js
// Climbing Stairs — how many distinct ways to climb n stairs (1 or 2 steps at a time)
// O(n) time, O(1) space — same recurrence as fibonacci
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2; // ways(i) = ways(i-1) + ways(i-2)
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
console.log(climbStairs(5));  // 8
console.log(climbStairs(10)); // 89

// Coin Change — minimum number of coins to make amount
// O(amount * coins.length) time, O(amount) space
function coinChange(coins, amount) {
  // dp[i] = minimum coins needed to make amount i
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // base case: 0 coins to make amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
console.log(coinChange([1, 5, 10, 25], 30)); // 2 (25 + 5)
console.log(coinChange([2], 3));               // -1 (impossible)

// Longest Common Subsequence — O(m * n) time, O(m * n) space
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  // dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; // characters match
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // skip one character
      }
    }
  }
  return dp[m][n];
}
console.log(longestCommonSubsequence("abcde", "ace"));    // 3 ("ace")
console.log(longestCommonSubsequence("abc", "def"));       // 0
console.log(longestCommonSubsequence("abcba", "abcbcba")); // 5

// 0/1 Knapsack — O(n * capacity) time, O(n * capacity) space
function knapsack(weights, values, capacity) {
  const n = weights.length;
  // dp[i][w] = max value using first i items with capacity w
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        // Choose max of: skip item i, or take item i
        dp[i][w] = Math.max(
          dp[i - 1][w],                                 // skip
          dp[i - 1][w - weights[i - 1]] + values[i - 1] // take
        );
      } else {
        dp[i][w] = dp[i - 1][w]; // item too heavy, skip
      }
    }
  }
  return dp[n][capacity];
}

const weights = [1, 3, 4, 5];
const values = [1, 4, 5, 7];
console.log(knapsack(weights, values, 7)); // 9 (items with weight 3+4, value 4+5)

// Space-optimized 0/1 Knapsack — O(n * capacity) time, O(capacity) space
function knapsackOptimized(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    // Traverse right to left to avoid using the same item twice
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}
console.log(knapsackOptimized(weights, values, 7)); // 9
```

---

## 11. Common Patterns Summary

A quick reference mapping common interview patterns to the types of problems they solve and their typical complexity.

```
| Pattern            | When to Use                                        | Examples                                      |
|--------------------|----------------------------------------------------|-----------------------------------------------|
| Two Pointers       | Sorted array, pair finding, partitioning           | Two Sum (sorted), remove duplicates, 3Sum     |
| Sliding Window     | Subarray/substring with constraint                 | Max sum subarray, longest substring no repeat  |
| Prefix Sum         | Range sum queries, subarray sums                   | Subarray sum equals k, range sum query         |
| Frequency Counter  | Counting occurrences, anagrams, duplicates         | Valid anagram, first unique char, top k freq   |
| Hash Map Lookup    | O(1) lookups, complements, grouping                | Two Sum, group anagrams, word pattern          |
| Fast & Slow Ptr    | Cycle detection, finding middle                    | Linked list cycle, middle of list, happy number|
| BFS                | Shortest path (unweighted), level-order traversal  | Level order, shortest path, word ladder        |
| DFS                | Exhaustive search, path finding, backtracking      | Number of islands, permutations, tree paths    |
| Binary Search      | Sorted data, minimize/maximize answer              | Search rotated array, first/last occurrence    |
| Topological Sort   | Dependency ordering, cycle detection in DAG        | Course schedule, build order                   |
| Divide & Conquer   | Split problem into independent subproblems         | Merge sort, quick sort, closest pair           |
| Dynamic Programming| Overlapping subproblems + optimal substructure     | Fibonacci, knapsack, coin change, LCS          |
| Greedy             | Local optimal choice leads to global optimal       | Activity selection, Huffman coding              |
| Backtracking       | Generate all combinations/permutations, constraint | N-Queens, Sudoku solver, subsets, combinations |
| Monotonic Stack    | Next greater/smaller element                       | Daily temperatures, largest rectangle histogram|
```

**How to pick a pattern in an interview:**

1. **Sorted array?** Think two pointers or binary search.
2. **Subarray or substring with a condition?** Think sliding window.
3. **Need O(1) lookups?** Think hash map or set.
4. **Tree or graph traversal?** Think BFS (shortest path / level order) or DFS (all paths / exhaustive).
5. **Optimization with overlapping subproblems?** Think dynamic programming.
6. **Generate all combinations?** Think backtracking.

---

## 12. Interview Questions & Answers

### Beginner

---

**Q1: What is the difference between an array and a linked list?**

An **array** stores elements in contiguous memory locations, allowing O(1) random access by index but O(n) insertion/deletion in the middle (elements must shift). A **linked list** stores elements in non-contiguous nodes connected by pointers, allowing O(1) insertion/deletion at the head but O(n) access to a specific element (must traverse from head).

```js
// Array: O(1) access, O(n) insert at beginning
const arr = [1, 2, 3];
arr[1];          // O(1) access
arr.unshift(0);  // O(n) — shifts all elements

// Linked list: O(n) access, O(1) insert at head
// list.find(val)  — O(n) traversal
// list.prepend(0) — O(1) pointer update
```

Choose arrays when you need random access. Choose linked lists when you need frequent insertions/deletions at the front or middle without shifting.

---

**Q2: Explain time complexity. What does O(n log n) mean?**

Time complexity describes how an algorithm's running time grows as the input size `n` increases. **O(n log n)** means that for each of the `n` elements, the algorithm performs approximately `log n` work. This is characteristic of efficient divide-and-conquer sorting algorithms like merge sort: it divides the array in half `log n` times, and at each level it processes all `n` elements during the merge step.

```js
// O(n log n) example — merge sort
// Level 0: 1 array of size n      → n work to merge
// Level 1: 2 arrays of size n/2   → n work to merge
// Level 2: 4 arrays of size n/4   → n work to merge
// ...
// Total levels: log n
// Total work: n * log n = O(n log n)
```

---

**Q3: How does a hash map achieve O(1) lookups?**

A hash map uses a **hash function** to convert a key into an array index. The key is hashed to produce a number, that number is mapped to an index (usually via modulo), and the value is stored at that index. On average, this gives O(1) time for insert, lookup, and delete. In the worst case (many collisions), it degrades to O(n), but good hash functions and resizing strategies keep this rare.

```js
// JavaScript's Map and plain objects use hash tables internally
const map = new Map();
map.set('name', 'Alice'); // hash('name') -> index -> store 'Alice'
map.get('name');           // hash('name') -> index -> retrieve 'Alice' — O(1)

// Collision handling: chaining (linked list at each bucket) or open addressing
```

---

**Q4: What is the difference between a stack and a queue?**

A **stack** follows Last-In-First-Out (LIFO) — the most recently added element is removed first, like a stack of plates. A **queue** follows First-In-First-Out (FIFO) — the earliest added element is removed first, like a line of people. Stacks are used for function calls, undo operations, and parsing. Queues are used for BFS, task scheduling, and buffering.

```js
// Stack (LIFO): push/pop from the same end
const stack = [];
stack.push(1); stack.push(2); stack.push(3);
stack.pop(); // 3 (last in, first out)

// Queue (FIFO): push to back, remove from front
const queue = [];
queue.push(1); queue.push(2); queue.push(3);
queue.shift(); // 1 (first in, first out)
```

---

**Q5: When would you use BFS vs DFS for tree traversal?**

Use **BFS** (Breadth-First Search) when you need to explore level by level — for example, finding the shortest path in an unweighted graph, level-order traversal, or finding the minimum depth of a tree. Use **DFS** (Depth-First Search) when you need to explore all paths, check existence of a path, or traverse to leaf nodes — for example, checking if a path sum exists, serializing a tree, or solving maze problems. BFS uses O(w) space (width of tree), while DFS uses O(h) space (height of tree).

```js
// BFS — level by level, uses queue — ideal for shortest path
// Space: O(w) where w is max width of tree
function bfsExample(root) {
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    // process node
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}

// DFS — go deep first, uses stack/recursion — ideal for path problems
// Space: O(h) where h is height of tree
function dfsExample(root) {
  if (!root) return;
  // process node
  dfsExample(root.left);
  dfsExample(root.right);
}
```

---

### Intermediate

---

**Q6: Solve the "Container With Most Water" problem.**

Given an array of heights, find two lines that together with the x-axis form a container that holds the most water. Use two pointers starting from both ends. The area is `min(height[left], height[right]) * (right - left)`. Move the pointer with the shorter height inward, since moving the taller one could never increase the area.

```js
// O(n) time, O(1) space
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let max = 0;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    max = Math.max(max, area);
    // Move the shorter side inward — it's the limiting factor
    if (height[left] < height[right]) left++;
    else right--;
  }
  return max;
}
console.log(maxArea([1,8,6,2,5,4,8,3,7])); // 49 (between index 1 and 8)
```

---

**Q7: How would you detect and remove a cycle in a linked list?**

Use **Floyd's cycle detection** (tortoise and hare). If slow and fast pointers meet, a cycle exists. To find the cycle start: reset one pointer to the head and advance both one step at a time — they meet at the cycle entry. To remove: find the node just before the cycle entry and set its `next` to `null`.

```js
// Detect cycle start — O(n) time, O(1) space
function detectCycleStart(head) {
  let slow = head, fast = head;
  // Phase 1: detect cycle
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      // Phase 2: find cycle start
      slow = head;
      while (slow !== fast) {
        slow = slow.next;
        fast = fast.next; // both move one step now
      }
      return slow; // cycle start
    }
  }
  return null; // no cycle
}

// Remove cycle
function removeCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      slow = head;
      // Edge case: cycle starts at head
      if (slow === fast) {
        while (fast.next !== slow) fast = fast.next;
      } else {
        while (slow.next !== fast.next) {
          slow = slow.next;
          fast = fast.next;
        }
      }
      fast.next = null; // break the cycle
      return true;
    }
  }
  return false;
}
```

---

**Q8: Explain when to use memoization vs tabulation in dynamic programming.**

**Memoization (top-down):** Start with the original problem and recurse. Cache results as you go. It only computes subproblems that are actually needed, which is beneficial when many subproblems are never reached. Downside: recursive call stack can overflow for large inputs.

**Tabulation (bottom-up):** Iteratively fill in a table starting from the base case. It computes all subproblems in order, which avoids recursion overhead and stack overflow. Preferred when you need all subproblems anyway or want to optimize space by only keeping the last row/few values.

```js
// Memoization — only computes needed subproblems
function climbMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 2) return n;
  memo[n] = climbMemo(n - 1, memo) + climbMemo(n - 2, memo);
  return memo[n];
}

// Tabulation — computes all subproblems, no recursion, easy to optimize space
function climbTab(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

console.log(climbMemo(30)); // 1346269
console.log(climbTab(30));  // 1346269
```

---

**Q9: Implement a function to validate a Binary Search Tree.**

A valid BST requires that for every node, all nodes in its left subtree have values strictly less than the node, and all in its right subtree have values strictly greater. Pass down min/max boundaries as you recurse to enforce this constraint.

```js
// O(n) time, O(h) space
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  // Current node must be within (min, max) exclusive
  if (root.val <= min || root.val >= max) return false;
  // Left subtree: all values must be < root.val
  // Right subtree: all values must be > root.val
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}

// Test with valid BST
const validBST = new TreeNode(5,
  new TreeNode(3, new TreeNode(1), new TreeNode(4)),
  new TreeNode(7, new TreeNode(6), new TreeNode(8))
);
console.log(isValidBST(validBST)); // true

// Test with invalid BST (right child of 3 is 9, which is > 5)
const invalidBST = new TreeNode(5,
  new TreeNode(3, new TreeNode(1), new TreeNode(9)),
  new TreeNode(7)
);
console.log(isValidBST(invalidBST)); // false
```

---

**Q10: Solve the "3Sum" problem — find all triplets that sum to zero.**

Sort the array, then for each element, use two pointers on the remaining subarray to find pairs that complete the sum. Skip duplicates to avoid redundant triplets.

```js
// O(n^2) time, O(1) space (ignoring output)
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip duplicate i

    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;   // skip dup
        while (left < right && nums[right] === nums[right - 1]) right--; // skip dup
        left++;
        right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}
console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1, -1, 2], [-1, 0, 1]]
```

---

### Advanced

---

**Q11: Design and implement an LRU (Least Recently Used) Cache.**

An LRU cache evicts the least recently accessed item when it reaches capacity. Use a **doubly linked list** (for O(1) removal and insertion at both ends) combined with a **hash map** (for O(1) key lookups). Every `get` and `put` operation makes the accessed item the most recent.

```js
class LRUNode {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();         // key -> node
    this.head = new LRUNode(0, 0); // dummy head (most recent)
    this.tail = new LRUNode(0, 0); // dummy tail (least recent)
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Remove a node from the doubly linked list
  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  // Insert a node right after head (most recently used position)
  _insertAfterHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);          // remove from current position
    this._insertAfterHead(node); // move to front (most recent)
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    }
    const node = new LRUNode(key, value);
    this._insertAfterHead(node);
    this.map.set(key, node);

    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;  // least recently used = just before tail
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}

const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));  // 1 (moves key 1 to front)
cache.put(3, 3);            // evicts key 2 (least recently used)
console.log(cache.get(2));  // -1 (evicted)
cache.put(4, 4);            // evicts key 1
console.log(cache.get(1));  // -1 (evicted)
console.log(cache.get(3));  // 3
console.log(cache.get(4));  // 4
```

---

**Q12: Solve the "Word Break" problem using dynamic programming.**

Given a string `s` and a dictionary of words, determine if `s` can be segmented into space-separated words from the dictionary. Use DP where `dp[i]` represents whether `s[0..i-1]` can be segmented.

```js
// O(n^2 * k) time where k = avg word length for substring comparison, O(n) space
function wordBreak(s, wordDict) {
  const wordSet = new Set(wordDict);
  // dp[i] = true if s[0..i-1] can be segmented into dictionary words
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true; // empty string is always valid

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      // If s[0..j-1] is valid AND s[j..i-1] is in dictionary
      if (dp[j] && wordSet.has(s.substring(j, i))) {
        dp[i] = true;
        break; // no need to check further
      }
    }
  }
  return dp[s.length];
}

console.log(wordBreak("leetcode", ["leet", "code"]));       // true
console.log(wordBreak("applepenapple", ["apple", "pen"]));  // true
console.log(wordBreak("catsandog", ["cats","dog","sand","and","cat"])); // false
```

---

**Q13: Implement Dijkstra's shortest path algorithm.**

Dijkstra's algorithm finds the shortest path from a source node to all other nodes in a **weighted graph with non-negative edges**. It uses a priority queue (min-heap) to always process the node with the smallest known distance first.

```js
// O((V + E) log V) time with a priority queue, O(V) space
class MinHeap {
  constructor() { this.heap = []; }

  push(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
      if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }

  get size() { return this.heap.length; }
}

function dijkstra(graph, source) {
  const dist = {};                // shortest distance from source to each node
  for (const node of graph.keys()) dist[node] = Infinity;
  dist[source] = 0;

  const pq = new MinHeap();
  pq.push([0, source]);          // [distance, node]

  while (pq.size > 0) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;   // skip if we already found a shorter path

    for (const [v, weight] of graph.get(u)) {
      const newDist = dist[u] + weight;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        pq.push([newDist, v]);
      }
    }
  }
  return dist;
}

// Build a weighted graph: node -> [[neighbor, weight], ...]
const wGraph = new Map();
wGraph.set('A', [['B', 1], ['C', 4]]);
wGraph.set('B', [['A', 1], ['C', 2], ['D', 5]]);
wGraph.set('C', [['A', 4], ['B', 2], ['D', 1]]);
wGraph.set('D', [['B', 5], ['C', 1]]);

console.log(dijkstra(wGraph, 'A'));
// { A: 0, B: 1, C: 3, D: 4 }
// A->B = 1, A->B->C = 3, A->B->C->D = 4
```

---

**Q14: Solve "Merge K Sorted Lists" efficiently.**

Given `k` sorted linked lists, merge them into one sorted list. Use a min-heap (priority queue) of size `k` to always extract the smallest current head across all lists. Time: O(N log k) where N is the total number of nodes.

```js
// O(N log k) time, O(k) space
function mergeKLists(lists) {
  const pq = new MinHeap();
  // Push the head of each list into the heap
  for (let i = 0; i < lists.length; i++) {
    if (lists[i]) pq.push([lists[i].val, i, lists[i]]); // [val, listIndex, node]
  }

  const dummy = new ListNode(0);
  let curr = dummy;

  while (pq.size > 0) {
    const [val, idx, node] = pq.pop();
    curr.next = node;
    curr = curr.next;
    if (node.next) {
      pq.push([node.next.val, idx, node.next]);
    }
  }
  return dummy.next;
}

// Test
const l1 = buildList([1, 4, 5]);
const l2 = buildList([1, 3, 4]);
const l3 = buildList([2, 6]);
console.log(toArray(mergeKLists([l1, l2, l3]))); // [1, 1, 2, 3, 4, 4, 5, 6]
```

---

**Q15: Explain and implement the "Trie" (Prefix Tree) data structure.**

A Trie is a tree-like data structure used for efficient prefix-based searching and storage of strings. Each node represents a character, and paths from root to marked nodes represent stored words. Tries enable O(m) search, insert, and prefix lookup where `m` is the word/prefix length -- independent of the number of stored words.

```js
class TrieNode {
  constructor() {
    this.children = {};  // char -> TrieNode
    this.isEnd = false;  // marks end of a complete word
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert a word — O(m) time where m = word length
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  // Search for exact word — O(m) time
  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd; // must be end of a word, not just a prefix
  }

  // Check if any word starts with prefix — O(m) time
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true; // prefix exists regardless of isEnd
  }

  // Get all words with a given prefix — O(m + k) where k = matching chars
  autocomplete(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    const results = [];
    function dfs(node, path) {
      if (node.isEnd) results.push(path);
      for (const [ch, child] of Object.entries(node.children)) {
        dfs(child, path + ch);
      }
    }
    dfs(node, prefix);
    return results;
  }
}

const trie = new Trie();
trie.insert("apple");
trie.insert("app");
trie.insert("application");
trie.insert("banana");

console.log(trie.search("app"));         // true
console.log(trie.search("ap"));          // false (prefix, not complete word)
console.log(trie.startsWith("app"));     // true
console.log(trie.startsWith("ban"));     // true
console.log(trie.startsWith("bat"));     // false
console.log(trie.autocomplete("app"));   // ["app", "apple", "application"]
```

---

## References

- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) -- Visual comparison of algorithm complexities
- [LeetCode](https://leetcode.com/) -- Practice coding problems with online judge
- [NeetCode](https://neetcode.io/) -- Curated roadmap of 150 LeetCode problems organized by pattern
- [Visualgo](https://visualgo.net/) -- Visualizations of data structures and algorithms
- [JavaScript Algorithms (trekhleb/javascript-algorithms)](https://github.com/trekhleb/javascript-algorithms) -- Algorithms and data structures implemented in JavaScript
- [Grokking the Coding Interview (Educative)](https://www.educative.io/courses/grokking-the-coding-interview) -- Pattern-based approach to interview problems
- [Introduction to Algorithms (CLRS)](https://mitpress.mit.edu/books/introduction-algorithms) -- The definitive algorithms textbook
- [MDN Web Docs — JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) -- JavaScript language reference
