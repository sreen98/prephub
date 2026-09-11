const n=`# Big-O Notation Cheat Sheet

## Complexity Rankings (Best → Worst)

| Big-O | Name | Example |
|-------|------|---------|
| O(1) | Constant | Hash table lookup, array index |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Array scan, linear search |
| O(n log n) | Linearithmic | Merge sort, heap sort |
| O(n²) | Quadratic | Nested loops, bubble sort |
| O(2ⁿ) | Exponential | Recursive fibonacci |
| O(n!) | Factorial | Permutations |

## Data Structure Operations

| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Stack | O(n) | O(n) | O(1) | O(1) |
| Queue | O(n) | O(n) | O(1) | O(1) |
| Linked List | O(n) | O(n) | O(1) | O(1) |
| Hash Table | - | O(1)* | O(1)* | O(1)* |
| BST (balanced) | O(log n) | O(log n) | O(log n) | O(log n) |
| Heap | - | O(n) | O(log n) | O(log n) |

*Average case. Worst case O(n) with hash collisions.

## Sorting Algorithms

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |

## Quick Rules

| Pattern | Complexity |
|---------|-----------|
| Single loop over n items | O(n) |
| Nested loop (2 levels) | O(n²) |
| Halving each step | O(log n) |
| Loop + halving | O(n log n) |
| All subsets | O(2ⁿ) |
| All permutations | O(n!) |
| Hash map lookup | O(1) average |

## JavaScript Built-in Complexity

| Operation | Complexity |
|-----------|-----------|
| \`Array.push/pop\` | O(1) |
| \`Array.shift/unshift\` | O(n) |
| \`Array.indexOf/includes\` | O(n) |
| \`Array.sort\` | O(n log n) |
| \`Object[key]\` access | O(1) |
| \`Map.get/set/has\` | O(1) |
| \`Set.add/has/delete\` | O(1) |
| \`String.indexOf\` | O(n×m) |

## Space Complexity

| Pattern | Space |
|---------|-------|
| Fixed variables | O(1) |
| Array copy | O(n) |
| 2D matrix | O(n²) |
| Recursive call stack (depth d) | O(d) |
| Hash map of n items | O(n) |

## Deriving Complexity
\`\`\`
1. Count the loops over the input        → n per nested level
2. Halving / doubling each step          → log n
3. Recursion: (branches)^(depth)         → 2^n for two calls, depth n
4. Drop constants and lower-order terms  → O(3n² + 5n + 9) = O(n²)
5. Sequential blocks ADD, nested MULTIPLY
\`\`\`
\`\`\`js
for (const a of xs) for (const b of ys) {}   // O(n·m), NOT O(n²) unless n === m
for (const a of xs) {} for (const b of xs) {} // O(n) + O(n) = O(n)
\`\`\`

## Amortized Analysis
\`Array.push\` is O(1) **amortized**: the backing array occasionally doubles (an O(n) copy), but spread across n pushes the average is constant. Same idea for hash-table resizing. This is why "worst case" and "amortized" are different answers to the same question — say which one you mean.

## Graph & Tree Algorithms
| Algorithm | Time | Space |
|---|---|---|
| BFS / DFS | O(V + E) | O(V) |
| Dijkstra (binary heap) | O((V + E) log V) | O(V) |
| Bellman-Ford | O(V·E) | O(V) |
| Topological sort (Kahn) | O(V + E) | O(V) |
| Union-Find (path compression + rank) | ~O(1) amortized | O(V) |
| Kruskal MST | O(E log E) | O(V) |
| Prim MST (heap) | O(E log V) | O(V) |

## Complexity by Pattern
| Pattern | Time | Typical use |
|---|---|---|
| Two pointers | O(n) | sorted-array pairs, palindromes |
| Sliding window | O(n) | longest/shortest subarray |
| Hash map counting | O(n) | anagrams, first duplicate |
| Binary search | O(log n) | sorted lookup, search-the-answer |
| Sort then scan | O(n log n) | intervals, dedupe |
| Heap of size k | O(n log k) | top-k |
| DP over 1D state | O(n) | climbing stairs, house robber |
| DP over 2D state | O(n·m) | edit distance, LCS |
| Backtracking | O(2ⁿ) / O(n!) | subsets, permutations |

## Hidden Costs in JavaScript
\`\`\`js
arr.shift() / arr.unshift();      // O(n) — reindexes everything. Use a deque.
[...acc, item];                   // O(n) INSIDE a loop → O(n²) overall
str += x;                         // O(n) per concat → O(n²). Use array + join.
arr.includes(x);                  // O(n) — inside a loop it's O(n·m). Use a Set.
Object.keys(o) / spread;          // O(n) each call
arr.splice(i, 1);                 // O(n)
arr.sort();                       // O(n log n) — and coerces to STRING by default
\`\`\`
\`\`\`js
// O(n²) → O(n)
const seen = new Set(ys);
xs.filter(x => seen.has(x));
\`\`\`

## Trade-offs
| Choice | Buys | Costs |
|---|---|---|
| Hash map | O(1) lookup | O(n) memory, no ordering |
| Sorting first | enables O(n) scan / binary search | O(n log n) up front |
| Memoization | avoids recomputation | O(states) memory |
| Precomputed index | fast reads | slower writes, staleness |

## Gotchas
- O(1) doesn't mean fast — a "constant" 500 ms is still 500 ms. Big-O hides constants.
- For small n, O(n²) often **beats** O(n log n) (which is why sorts switch to insertion sort under ~16 elements).
- Hash operations are O(1) **average**, O(n) worst case with collisions.
- \`Array.sort\` worst case is engine-dependent; V8 uses TimSort, so it is O(n log n) and **stable** since ES2019.
- Recursion costs O(depth) stack space — and V8 has **no tail-call optimisation**, so deep recursion throws \`RangeError\`.
- Space complexity usually excludes the input but **includes** the call stack and the output.
- Always state which variable you mean: O(n) in rows is not O(n) in characters.
`;export{n as default};
