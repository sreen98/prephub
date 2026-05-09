// Tiny manifest of templates that have a step-by-step explanation registered.
// Imported synchronously by CodePlayground to decide whether to render the
// "Explain" button without pulling in the full ~80 KB explanation bodies.
// Kept in lockstep with the keys of `playgroundExplanations` in
// ./playgroundExplanations.ts.

export const playgroundExplanationKeys: ReadonlySet<string> = new Set([
  'Two Sum',
  'Reverse String',
  'Valid Palindrome',
  'FizzBuzz',
  'Max Profit',
  'Valid Parentheses',
  'Merge Sorted Arrays',
  'Flatten Array',
  'Debounce',
  'Group Anagrams',
  'Find Duplicates',
  'Remove Duplicates',
  'Find Missing Number',
  'Move Zeros',
  'Rotate Array',
  'Bubble Sort',
  'Quick Sort',
  'Merge Sort',
  'Anagram Check',
  'Longest Substring',
  'First Non-Repeating Char',
  'Sum Curry',
  'Memoize',
  'Deep Clone',
  'Throttle',
  'EventEmitter',
  'LRU Cache',
  'Compose & Pipe',
  'Binary Search',
  'Roman to Integer',
  'Reverse Linked List',
  'Container With Most Water',
  'Climbing Stairs',
  'Balanced Brackets (Count)',
  'Second Largest Number',
]);
