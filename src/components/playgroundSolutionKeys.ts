// Tiny sync-imported manifest of which Coding Challenges have a Show-Solution
// entry. Loaded eagerly so the toolbar can decide synchronously whether to
// render the "Show Solution" button. The actual solution code lives in
// playgroundSolutions.ts which is dynamically imported on first click.
//
// Keep this in sync with the keys in playgroundSolutions.ts.

export const playgroundSolutionKeys: ReadonlySet<string> = new Set([
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
  'Binary Search',
  'Roman to Integer',
  'Reverse Linked List',
  'Container With Most Water',
  'Climbing Stairs',
  'Balanced Brackets (Count)',
  'Second Largest Number',
  'Compose & Pipe',
]);
