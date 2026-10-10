import { readFileSync } from 'node:fs';

/**
 * Test helper. React (v1.7.14), JavaScript and TypeScript (v1.7.15) are each a series of guide
 * files, and a pinned code block may live in any part. Content tests read a whole series as one
 * string, so a block's marker keeps working wherever the block moves, and a marker's uniqueness
 * check stays series-wide. Files are in reading order: core guide, then the rest.
 */
export const GUIDE_SERIES = {
  react: [
    'front-end/react-guide.md',
    'front-end/react-performance-guide.md',
    'front-end/react-19-patterns-guide.md',
    'front-end/react-interview-questions.md',
    'front-end/react-tricky-questions.md',
  ],
  javascript: [
    'javascript-and-typescript/javascript-guide.md',
    'javascript-and-typescript/javascript-interview-questions.md',
    'javascript-and-typescript/javascript-tricky-questions.md',
  ],
  typescript: [
    'javascript-and-typescript/typescript-guide.md',
    'javascript-and-typescript/typescript-interview-questions.md',
    'javascript-and-typescript/typescript-tricky-questions.md',
  ],
} as const;

export type SeriesName = keyof typeof GUIDE_SERIES;

/** Every file of a series, LF-normalised and joined in reading order. */
export function readSeries(name: SeriesName): string {
  return GUIDE_SERIES[name]
    .map((f) => readFileSync(`src/content/${f}`, 'utf8').replace(/\r\n/g, '\n'))
    .join('\n');
}
