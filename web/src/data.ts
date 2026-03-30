import { Monitor, Braces, Server, Layers, Cloud, Binary, Users, GitCompare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { type ReactNode, isValidElement } from 'react';

// ==================== Interfaces ====================

export interface OfficialDoc {
  label: string;
  url: string;
}

export interface MenuItem {
  name: string;
  path: string;
  file: string;
  officialDocs?: OfficialDoc[];
}

export interface MenuSection {
  name: string;
  path?: string;
  file?: string;
  icon?: LucideIcon;
  gradient?: string;
  lightBg?: string;
  darkBg?: string;
  accent?: string;
  description?: string;
  items?: MenuItem[];
}

export interface CheatSheet {
  name: string;
  path: string;
  file: string;
  color: string;
  description: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  guide: string;
  type: 'output' | 'conceptual';
  difficulty?: string;
}

export interface Heading {
  level: number;
  text: string;
  id: string;
}

// ==================== Data ====================

export const contentFiles: Record<string, string> = import.meta.glob('./content/**/*.md', { query: '?raw', import: 'default', eager: true });

export const menuStructure: MenuSection[] = [
  { name: 'Introduction', path: '/', file: './content/README.md' },
  {
    name: 'Front End',
    icon: Monitor,
    gradient: 'from-blue-500 to-cyan-400',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/30',
    accent: 'text-blue-600 dark:text-blue-400',
    description: 'React, Redux, TanStack Query & Storybook',
    items: [
      { name: 'React Guide', path: '/frontend/react', file: './content/front-end/react-guide.md', officialDocs: [{ label: 'React', url: 'https://react.dev' }] },
      { name: 'Redux Toolkit', path: '/frontend/redux-toolkit', file: './content/front-end/redux-toolkit-guide.md', officialDocs: [{ label: 'Redux Toolkit', url: 'https://redux-toolkit.js.org' }] },
      { name: 'Redux Saga', path: '/frontend/redux-saga', file: './content/front-end/redux-saga-guide.md', officialDocs: [{ label: 'Redux-Saga', url: 'https://redux-saga.js.org' }] },
      { name: 'TanStack Query', path: '/frontend/tanstack-query', file: './content/front-end/tanstack-query-guide.md', officialDocs: [{ label: 'TanStack Query', url: 'https://tanstack.com/query/latest' }] },
      { name: 'Storybook', path: '/frontend/storybook', file: './content/front-end/storybook-guide.md', officialDocs: [{ label: 'Storybook', url: 'https://storybook.js.org/docs' }] },
      { name: 'Jest & React Testing Library', path: '/frontend/jest-react-testing-library', file: './content/front-end/jest-react-testing-library-guide.md', officialDocs: [{ label: 'Jest', url: 'https://jestjs.io/docs/getting-started' }, { label: 'Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro' }] },
      { name: 'React Comparisons', path: '/frontend/comparisons', file: './content/front-end/react-comparisons.md', officialDocs: [] },
    ]
  },
  {
    name: 'JS & TS',
    icon: Braces,
    gradient: 'from-amber-500 to-orange-400',
    lightBg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-950/30',
    accent: 'text-amber-600 dark:text-amber-400',
    description: 'JavaScript, TypeScript & tricky interview problems',
    items: [
      { name: 'JavaScript Guide', path: '/javascript/guide', file: './content/javascript-and-typescript/javascript-guide.md', officialDocs: [{ label: 'MDN JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }] },
      { name: 'TypeScript Guide', path: '/javascript/typescript', file: './content/javascript-and-typescript/typescript-guide.md', officialDocs: [{ label: 'TypeScript', url: 'https://www.typescriptlang.org/docs' }] },
      { name: 'JS Comparisons', path: '/javascript/comparisons', file: './content/javascript-and-typescript/js-comparisons.md', officialDocs: [] },
    ]
  },
  {
    name: 'Back End',
    icon: Server,
    gradient: 'from-emerald-500 to-teal-400',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/30',
    accent: 'text-emerald-600 dark:text-emerald-400',
    description: 'Node.js, Express, MongoDB, API Design & Database Schema',
    items: [
      { name: 'Node.js Guide', path: '/backend/nodejs', file: './content/back-end/nodejs-guide.md', officialDocs: [{ label: 'Node.js', url: 'https://nodejs.org/docs/latest/api' }] },
      { name: 'Express.js Guide', path: '/backend/expressjs', file: './content/back-end/expressjs-guide.md', officialDocs: [{ label: 'Express.js', url: 'https://expressjs.com' }] },
      { name: 'MongoDB Guide', path: '/backend/mongodb', file: './content/back-end/mongodb-guide.md', officialDocs: [{ label: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual' }] },
      { name: 'API Design', path: '/backend/api-design', file: './content/back-end/api-design-guide.md', officialDocs: [{ label: 'OpenAPI Spec', url: 'https://swagger.io/specification' }] },
      { name: 'Database Schema', path: '/backend/database-schema', file: './content/back-end/database-schema-guide.md', officialDocs: [{ label: 'MongoDB Data Modeling', url: 'https://www.mongodb.com/docs/manual/data-modeling' }] },
      { name: 'Backend Comparisons', path: '/backend/comparisons', file: './content/back-end/backend-comparisons.md', officialDocs: [] },
    ]
  },
  {
    name: 'AWS',
    icon: Cloud,
    gradient: 'from-orange-500 to-yellow-400',
    lightBg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-950/30',
    accent: 'text-orange-600 dark:text-orange-400',
    description: 'IAM, EC2, S3, Lambda, CloudWatch & deployment',
    items: [
      { name: 'IAM & Security', path: '/aws/iam', file: './content/aws/aws-iam-guide.md', officialDocs: [{ label: 'AWS IAM', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide' }] },
      { name: 'EC2 & Networking', path: '/aws/ec2', file: './content/aws/aws-ec2-guide.md', officialDocs: [{ label: 'AWS EC2', url: 'https://docs.aws.amazon.com/ec2' }] },
      { name: 'S3 & Storage', path: '/aws/s3', file: './content/aws/aws-s3-guide.md', officialDocs: [{ label: 'AWS S3', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide' }] },
      { name: 'Lambda', path: '/aws/lambda', file: './content/aws/aws-lambda-guide.md', officialDocs: [{ label: 'AWS Lambda', url: 'https://docs.aws.amazon.com/lambda/latest/dg' }] },
      { name: 'CloudWatch & Monitoring', path: '/aws/cloudwatch', file: './content/aws/aws-cloudwatch-guide.md', officialDocs: [{ label: 'AWS CloudWatch', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring' }] },
      { name: 'Frontend Deployment', path: '/aws/frontend-deployment', file: './content/aws/aws-frontend-deployment-guide.md', officialDocs: [{ label: 'AWS CloudFront', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide' }] },
      { name: 'AWS Comparisons', path: '/aws/comparisons', file: './content/aws/aws-comparisons.md', officialDocs: [] },
    ]
  },
  {
    name: 'Git',
    icon: GitCompare,
    gradient: 'from-slate-500 to-gray-400',
    lightBg: 'bg-slate-50',
    darkBg: 'dark:bg-slate-950/30',
    accent: 'text-slate-600 dark:text-slate-400',
    description: 'Branching, merging, rebasing, workflows & internals',
    items: [
      { name: 'Git Guide', path: '/git/guide', file: './content/git/git-guide.md', officialDocs: [{ label: 'Git Docs', url: 'https://git-scm.com/doc' }, { label: 'Learn Git Branching', url: 'https://learngitbranching.js.org' }] },
      { name: 'Git Comparisons', path: '/git/comparisons', file: './content/git/git-comparisons.md', officialDocs: [] },
    ]
  },
  {
    name: 'DSA',
    icon: Binary,
    gradient: 'from-rose-500 to-pink-400',
    lightBg: 'bg-rose-50',
    darkBg: 'dark:bg-rose-950/30',
    accent: 'text-rose-600 dark:text-rose-400',
    description: 'Data structures, algorithms & coding patterns',
    items: [
      { name: 'DSA Guide', path: '/dsa/guide', file: './content/dsa/dsa-guide.md', officialDocs: [] },
    ]
  },
  {
    name: 'Behavioral',
    icon: Users,
    gradient: 'from-teal-500 to-cyan-400',
    lightBg: 'bg-teal-50',
    darkBg: 'dark:bg-teal-950/30',
    accent: 'text-teal-600 dark:text-teal-400',
    description: 'STAR method, leadership principles & soft skills',
    items: [
      { name: 'Behavioral Guide', path: '/behavioral/guide', file: './content/behavioral/behavioral-guide.md', officialDocs: [] },
    ]
  },
  {
    name: 'System Design',
    icon: Layers,
    gradient: 'from-violet-500 to-purple-400',
    lightBg: 'bg-violet-50',
    darkBg: 'dark:bg-violet-950/30',
    accent: 'text-violet-600 dark:text-violet-400',
    description: 'Scalability, distributed systems & architecture',
    items: [
      { name: 'System Design Guide', path: '/system-design/guide', file: './content/system-design/system-design-guide.md', officialDocs: [] },
      { name: 'Design Comparisons', path: '/system-design/comparisons', file: './content/system-design/sysdesign-comparisons.md', officialDocs: [] },
    ]
  }
];

// ==================== Utilities ====================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getTextContent(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join('');
  if (isValidElement(children) && children.props) {
    return getTextContent((children.props as { children?: ReactNode }).children);
  }
  return '';
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{2,4})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const raw = match[2]
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
    headings.push({
      level: match[1].length,
      text: raw,
      id: slugify(raw),
    });
  }
  return headings;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== Reading Time ====================

export function estimateReadingTime(markdown: string): number {
  if (!markdown) return 1;
  // Separate code blocks from prose
  let codeWords = 0;
  const proseOnly = markdown.replace(/```[\s\S]*?```/g, (match) => {
    codeWords += match.split(/\s+/).length;
    return '';
  });
  // Strip markdown syntax
  const cleaned = proseOnly
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*|__|~~|`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '');
  const proseWords = cleaned.split(/\s+/).filter(Boolean).length;
  // Prose at 200 wpm, code at 100 wpm
  const minutes = Math.ceil((proseWords / 200) + (codeWords / 100));
  return Math.max(1, minutes);
}

// ==================== Quiz Q&A Parser ====================

interface DifficultyRange {
  difficulty: string;
  startIndex: number;
}

function parseDifficultyRanges(content: string): DifficultyRange[] {
  const ranges: DifficultyRange[] = [];
  const regex = /^### (Beginner|Intermediate|Advanced)(?:\s*\(.*?\))?\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    ranges.push({ difficulty: match[1].toLowerCase(), startIndex: match.index });
  }
  return ranges;
}

function getDifficulty(questionIndex: number, difficultyRanges: DifficultyRange[]): string | undefined {
  if (difficultyRanges.length === 0) return undefined;
  for (let i = difficultyRanges.length - 1; i >= 0; i--) {
    if (questionIndex >= difficultyRanges[i].startIndex) {
      return difficultyRanges[i].difficulty;
    }
  }
  return undefined;
}

export function extractQuestions(content: string, guideName: string): Question[] {
  const questions: Question[] = [];
  const difficultyRanges = parseDifficultyRanges(content);

  // Pattern 1: JS Interview Prep style — ## QN + code block + output + explanation
  const jsPattern = /^## Q(\d+)\s*\n([\s\S]*?)(?=^## Q\d+\s*$|$)/gm;
  const jsMatches = [...content.matchAll(jsPattern)];

  if (jsMatches.length > 3) {
    for (const m of jsMatches) {
      const block = m[2];
      const codeMatch = block.match(/```[\w]*\n([\s\S]*?)```/);
      const outputMatch = block.match(/###\s*✅\s*Output[\s\S]*?\n([\s\S]*?)(?=###|---|$)/);
      const explainMatch = block.match(/###\s*💡\s*Explanation\s*\n([\s\S]*?)(?=---|^## |$)/m);

      if (codeMatch) {
        questions.push({
          id: `${guideName}-q${m[1]}`,
          question: `What is the output?\n\n\`\`\`javascript\n${codeMatch[1].trim()}\n\`\`\``,
          answer: [
            outputMatch ? `**Output:**\n\`\`\`\n${outputMatch[1].trim()}\n\`\`\`` : '',
            explainMatch ? `\n\n**Explanation:**\n${explainMatch[1].trim()}` : '',
          ].filter(Boolean).join('\n'),
          guide: guideName,
          type: 'output',
          difficulty: getDifficulty(m.index!, difficultyRanges),
        });
      }
    }
    return questions;
  }

  // Pattern 2: Standard guide style — **QN: Question text** followed by answer
  const stdPattern = /\*\*Q(\d+):\s*(.+?)\*\*\s*\n([\s\S]*?)(?=\*\*Q\d+:|---(?:\s*\n)|$)/g;
  const stdMatches = [...content.matchAll(stdPattern)];

  for (const m of stdMatches) {
    const answer = m[3].trim();
    if (answer.length > 10) {
      questions.push({
        id: `${guideName}-q${m[1]}`,
        question: m[2].trim(),
        answer,
        guide: guideName,
        type: 'conceptual',
        difficulty: getDifficulty(m.index!, difficultyRanges),
      });
    }
  }

  return questions;
}

export function getAllQuestions(): Question[] {
  const questions: Question[] = [];
  for (const section of menuStructure) {
    if (!section.items) continue;
    for (const item of section.items) {
      const content = contentFiles[item.file] || '';
      const qs = extractQuestions(content, item.name);
      questions.push(...qs);
    }
  }
  return questions;
}

// ==================== Cheat Sheets ====================

export const cheatSheets: CheatSheet[] = [
  { name: 'React Hooks', path: '/cheatsheets/react-hooks', file: './content/cheatsheets/react-hooks.md', color: 'blue', description: 'useState, useEffect, useRef, useMemo, custom hooks' },
  { name: 'JavaScript ES6+', path: '/cheatsheets/javascript-es6', file: './content/cheatsheets/javascript-es6.md', color: 'amber', description: 'Destructuring, spread, promises, modules, optional chaining' },
  { name: 'Git Commands', path: '/cheatsheets/git-commands', file: './content/cheatsheets/git-commands.md', color: 'orange', description: 'Branching, merging, rebasing, undoing, remotes' },
  { name: 'Git Workflows & Advanced', path: '/cheatsheets/git-workflows', file: './content/cheatsheets/git-workflows.md', color: 'teal', description: 'Interactive rebase, cherry-pick, bisect, reflog, worktrees, Git Flow, GitHub Flow' },
  { name: 'Big-O Notation', path: '/cheatsheets/big-o-notation', file: './content/cheatsheets/big-o-notation.md', color: 'emerald', description: 'Time/space complexity, data structures, sorting algorithms' },
  { name: 'CSS Flexbox & Grid', path: '/cheatsheets/css-flexbox-grid', file: './content/cheatsheets/css-flexbox-grid.md', color: 'violet', description: 'Flex containers, grid layouts, common patterns' },
  { name: 'HTTP Status Codes', path: '/cheatsheets/http-status-codes', file: './content/cheatsheets/http-status-codes.md', color: 'rose', description: '2xx success, 4xx client errors, 5xx server errors, REST mapping' },
];

// ==================== Text-to-Speech ====================

export function extractProseText(markdown: string): string[] {
  let text = markdown.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/\*\*|__|~~|`/g, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');
  text = text.replace(/^\|.*\|$/gm, '');
  text = text.replace(/^[-*] /gm, '');
  text = text.replace(/^\d+\. /gm, '');
  return text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 5);
}
