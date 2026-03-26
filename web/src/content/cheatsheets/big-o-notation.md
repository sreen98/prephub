# Big-O Notation Cheat Sheet

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
| `Array.push/pop` | O(1) |
| `Array.shift/unshift` | O(n) |
| `Array.indexOf/includes` | O(n) |
| `Array.sort` | O(n log n) |
| `Object[key]` access | O(1) |
| `Map.get/set/has` | O(1) |
| `Set.add/has/delete` | O(1) |
| `String.indexOf` | O(n×m) |

## Space Complexity

| Pattern | Space |
|---------|-------|
| Fixed variables | O(1) |
| Array copy | O(n) |
| 2D matrix | O(n²) |
| Recursive call stack (depth d) | O(d) |
| Hash map of n items | O(n) |
