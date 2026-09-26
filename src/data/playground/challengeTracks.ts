import type { Difficulty, Pattern } from './playgroundTemplates';
import { allTemplates, type FlatTemplateMeta } from './templateIndex';

/**
 * Study tracks: challenges grouped so that problems solved with the same idea
 * are tried together, easiest first. Doing five Sliding Window problems in a row
 * teaches the technique; doing them scattered across a list of 99 does not.
 *
 * JS tracks are DERIVED from the `patterns` each challenge already carries, so a
 * new challenge joins its tracks automatically. A challenge with two patterns
 * appears in both tracks, which is the point: it is practice for both ideas.
 * React machine-coding challenges carry no patterns, so their tracks are themes,
 * listed by hand; `challengeTracks.test.ts` fails if a React challenge is missing
 * from them or listed twice.
 */

export interface ChallengeTrack {
  id: string;
  title: string;
  /** One or two sentences: the idea the whole track practises. */
  idea: string;
  tag: 'JS' | 'React';
  /** Challenge names, in the order to attempt them. */
  names: string[];
}

/** What each technique IS, in plain words: the reason to do the track at all. */
export const PATTERN_IDEAS: Record<Pattern, string> = {
  'Two Pointer': 'Two indexes move through the data, from both ends or at different speeds, so one pass replaces a nested loop.',
  'Sliding Window': 'Keep a window over a contiguous range and slide it: add the item entering, remove the item leaving, instead of recomputing the whole range.',
  'Hash Map / Set': 'Remember what you have already seen in a Map or Set, so "have I seen this before?" is one O(1) lookup instead of another loop.',
  'Stack': 'Keep the items still waiting to be matched or answered on a stack; the most recent one is always the next to be resolved.',
  'Recursion / D&C': 'Solve a smaller copy of the same problem and combine the results (divide and conquer), with a base case that stops the recursion.',
  'Dynamic Programming': 'Build the answer from answers to smaller subproblems, and store each one so it is computed only once.',
  'Greedy': 'Make the choice that looks best right now and never undo it, which works when a local best choice is provably part of a global best one.',
  'Binary Search': 'Halve the search space each step by asking a yes/no question about the middle, which needs sorted (or monotonic) data.',
  'Backtracking': 'Build candidates one choice at a time, and undo the last choice (backtrack) as soon as it cannot lead to a valid answer.',
  'Math / Bit': 'Use a numeric identity or a bit trick (such as XOR cancelling pairs) to get the answer without extra space or loops.',
  'Sorting': 'Sort first, so equal or related items end up next to each other, then make one pass over the sorted data.',
  'Linked List': 'Walk and rewire nodes through their next pointers, usually with a dummy head, two pointers, or both.',
  'Closure / State': 'A function that remembers private state between calls: the building block of debounce, memoize, once and event emitters.',
  'In-Place': 'Rearrange the array inside itself, swapping and overwriting, so the extra space stays O(1).',
  'Tree Traversal': 'Visit every node of a tree once, either depth-first (recursion or an explicit stack) or level by level (a queue), carrying whatever the question needs: a depth, a path, or a parent.',
};

const DIFFICULTY_RANK: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };

function byDifficulty(a: FlatTemplateMeta, b: FlatTemplateMeta): number {
  const da = a.difficulty ? DIFFICULTY_RANK[a.difficulty] : 2;
  const db = b.difficulty ? DIFFICULTY_RANK[b.difficulty] : 2;
  return da - db;   // Array sort is stable, so equal difficulties keep the file's order
}

/** Theme tracks for React machine coding, roughly easier to harder inside each. */
const REACT_TRACKS: Omit<ChallengeTrack, 'tag'>[] = [
  {
    id: 'react-state-basics',
    title: 'State & Rendering Basics',
    idea: 'Components that own a little state and re-render from it: the core loop of every React UI, and where re-render cost first shows up.',
    names: ['Counter (optimized re-renders)', 'Star Rating', 'Stopwatch', 'Calculator', 'Tic-Tac-Toe', 'Button (variants + sizes)', 'Theme Switcher (dark/light)', 'Todo List (localStorage + memo)'],
  },
  {
    id: 'react-forms',
    title: 'Forms & Input',
    idea: 'Controlled inputs, validation that appears at the right moment, and keyboard-friendly input widgets.',
    names: ['Form with Validation', 'Form with Dynamic Fields', 'Multi-Step Form (Wizard)', 'OTP Input', 'Search Filter', 'Search with Debounce + Cancel', 'Auto-Complete (ARIA combobox)'],
  },
  {
    id: 'react-data',
    title: 'Data Fetching & Lists',
    idea: 'Loading data, showing its loading, empty and error states, and keeping long lists fast.',
    names: ['Display Data from a JSON Prop', 'Fetch Users from an API', 'JSON → API → React fetch', 'Pagination', 'Product List Sort & Filter', 'Data Table (sort + filter + paginate)', 'Infinite Scroll', 'Image Gallery + Lazy Load', 'Responsive Images (srcset / AVIF)', 'Client Cache (stale-while-revalidate)', 'Suspense + Lazy (Code Splitting)'],
  },
  {
    id: 'react-overlays',
    title: 'Overlays & Disclosure',
    idea: 'UI that shows and hides content: focus management, keyboard support and the ARIA roles a screen reader needs.',
    names: ['Accordion', 'Tabs', 'Carousel / Slider', 'Modal Component', 'Modal (Portal + Focus Trap)', 'Toast / Snackbar', 'Notifications'],
  },
  {
    id: 'react-navigation',
    title: 'Navigation & Layout',
    idea: 'Structure and movement around an app: responsive navigation, guarded routes, recursive trees and drag-and-drop.',
    names: ['Responsive Navbar', 'Sidebar Navigation (responsive + submenus)', 'Protected Route (Auth + RBAC)', 'Nested Comments (recursive replies)', 'Drag and Drop'],
  },
  {
    id: 'react-async',
    title: 'Async Actions & Real-Time',
    idea: 'User actions that talk to a server: optimistic updates, duplicate-request guards, progress, and live data over WebSockets.',
    names: ['Optimistic UI Updates', 'Like Button (optimistic + rollback)', 'Rate-Limited Button (throttle vs lock)', 'File Upload (progress + cancel)', 'WebSocket Live Feed', 'Chat App'],
  },
  {
    id: 'react-architecture',
    title: 'State Architecture',
    idea: 'Where state lives once several components share it: reducers, derived values and a store you build yourself.',
    names: ['Shopping Cart (reducer + derived totals)', 'Mini Redux Store'],
  },
];

/**
 * TypeScript challenges (lang 'ts') are graded by the type checker and carry no
 * algorithmic pattern, so they stay out of the pattern tracks AND out of
 * "Array & String Walks" (which is for pattern-less algorithm problems), and
 * get one track of their own.
 */
const isTypeScriptChallenge = (t: FlatTemplateMeta) => t.lang === 'ts' || t.lang === 'tsx';

function buildTypeScriptTrack(): ChallengeTrack[] {
  const names = allTemplates
    .filter((t) => t.kind === 'challenge' && t.tag === 'JS' && isTypeScriptChallenge(t))
    .sort(byDifficulty)
    .map((t) => t.name);
  return names.length ? [{
    id: 'js-typescript-types',
    title: 'TypeScript Types',
    idea: 'Write the types, not just the code: describe the shape of the data so that a wrong key, a missing case or a bad payload is caught by the compiler before the code ever runs.',
    tag: 'JS',
    names,
  }] : [];
}

function buildJsTracks(): ChallengeTrack[] {
  const js = allTemplates.filter((t) => t.kind === 'challenge' && t.tag === 'JS' && !isTypeScriptChallenge(t));
  const byPattern = (Object.keys(PATTERN_IDEAS) as Pattern[])
    .map((pattern) => ({
      id: 'js-' + pattern.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
      title: pattern,
      idea: PATTERN_IDEAS[pattern],
      tag: 'JS' as const,
      names: js.filter((t) => t.patterns?.includes(pattern)).sort(byDifficulty).map((t) => t.name),
    }))
    .filter((track) => track.names.length > 0);
  // Challenges with no pattern still belong somewhere, or they vanish from the
  // tracks view. They are the "no trick, just be exact" problems.
  const untagged = js.filter((t) => !t.patterns?.length).sort(byDifficulty).map((t) => t.name);
  return untagged.length
    ? [...byPattern, {
        id: 'js-array-string-walks',
        title: 'Array & String Walks',
        idea: 'No special data structure: one careful pass with the boundaries exactly right, such as carrying a digit, walking a matrix edge or parsing character by character.',
        tag: 'JS' as const,
        names: untagged,
      }]
    : byPattern;
}

export const challengeTracks: ChallengeTrack[] = [
  ...buildJsTracks(),
  ...buildTypeScriptTrack(),
  ...REACT_TRACKS.map((t) => ({ ...t, tag: 'React' as const })),
];

export function findTrack(id: string | null | undefined): ChallengeTrack | null {
  return challengeTracks.find((t) => t.id === id) ?? null;
}

/** The first track a challenge belongs to, for "continue in this track". */
export function firstTrackFor(name: string): ChallengeTrack | null {
  return challengeTracks.find((t) => t.names.includes(name)) ?? null;
}
