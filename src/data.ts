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
  // Index signature lets MenuItem flow into hooks that accept generic
  // `{ path: string; [key: string]: unknown }` shapes (e.g. ProgressItem).
  [key: string]: unknown;
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
  // Index signature for compatibility with useSpacedRepetition's
  // `{ id: string; [key: string]: unknown }` shape.
  [key: string]: unknown;
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
    description: 'React, Next.js & RSC, Frontend Architecture, Modern CSS, Accessibility, Web Performance, Testing Strategy, React Native, Redux, TanStack Query, Browser APIs & Tooling',
    items: [
      { name: 'React Guide', path: '/frontend/react', file: './content/front-end/react-guide.md', officialDocs: [{ label: 'React', url: 'https://react.dev' }] },
      { name: 'React Native & Apps', path: '/frontend/react-native', file: './content/front-end/react-native-guide.md', officialDocs: [{ label: 'React Native', url: 'https://reactnative.dev' }, { label: 'Expo', url: 'https://docs.expo.dev' }, { label: 'React Navigation', url: 'https://reactnavigation.org' }] },
      { name: 'Play Store Launch', path: '/frontend/play-store-launch', file: './content/front-end/play-store-launch-guide.md', officialDocs: [{ label: 'Play Console', url: 'https://play.google.com/console' }, { label: 'Play Console Help', url: 'https://support.google.com/googleplay/android-developer' }, { label: 'EAS Build', url: 'https://docs.expo.dev/build/introduction' }] },
      { name: 'Redux Toolkit', path: '/frontend/redux-toolkit', file: './content/front-end/redux-toolkit-guide.md', officialDocs: [{ label: 'Redux Toolkit', url: 'https://redux-toolkit.js.org' }] },
      { name: 'Redux Saga', path: '/frontend/redux-saga', file: './content/front-end/redux-saga-guide.md', officialDocs: [{ label: 'Redux-Saga', url: 'https://redux-saga.js.org' }] },
      { name: 'TanStack Query', path: '/frontend/tanstack-query', file: './content/front-end/tanstack-query-guide.md', officialDocs: [{ label: 'TanStack Query', url: 'https://tanstack.com/query/latest' }] },
      { name: 'Storybook', path: '/frontend/storybook', file: './content/front-end/storybook-guide.md', officialDocs: [{ label: 'Storybook', url: 'https://storybook.js.org/docs' }] },
      { name: 'Jest & React Testing Library', path: '/frontend/jest-react-testing-library', file: './content/front-end/jest-react-testing-library-guide.md', officialDocs: [{ label: 'Jest', url: 'https://jestjs.io/docs/getting-started' }, { label: 'Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro' }] },
      { name: 'Frontend Tooling', path: '/frontend/tooling', file: './content/front-end/frontend-tooling-guide.md', officialDocs: [{ label: 'Webpack', url: 'https://webpack.js.org/concepts' }, { label: 'Vite', url: 'https://vitejs.dev/guide' }, { label: 'npm Docs', url: 'https://docs.npmjs.com' }] },
      { name: 'Browser APIs', path: '/frontend/browser-apis', file: './content/front-end/browser-apis-guide.md', officialDocs: [{ label: 'MDN Web APIs', url: 'https://developer.mozilla.org/en-US/docs/Web/API' }, { label: 'web.dev', url: 'https://web.dev' }, { label: 'HTML Living Standard', url: 'https://html.spec.whatwg.org' }] },
      { name: 'Real-Time Web', path: '/frontend/realtime-web', file: './content/front-end/realtime-web-guide.md', officialDocs: [{ label: 'MDN — SSE', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events' }, { label: 'MDN — WebSockets', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' }, { label: 'RFC 6455 — WebSocket Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc6455' }] },
      { name: 'Design Patterns', path: '/frontend/design-patterns', file: './content/front-end/design-patterns-guide.md', officialDocs: [{ label: 'Refactoring.guru — Design Patterns', url: 'https://refactoring.guru/design-patterns' }, { label: 'Patterns.dev', url: 'https://www.patterns.dev' }] },
      { name: 'Refactoring & Code Review', path: '/frontend/refactoring-code-review', file: './content/front-end/refactoring-code-review-guide.md', officialDocs: [{ label: 'Refactoring.guru', url: 'https://refactoring.guru/refactoring' }, { label: 'Google Engineering Practices', url: 'https://google.github.io/eng-practices/review/' }] },
      { name: 'Frontend Architecture', path: '/frontend/architecture', file: './content/front-end/frontend-architecture-guide.md', officialDocs: [{ label: 'Monorepo Tools', url: 'https://monorepo.tools' }, { label: 'Turborepo', url: 'https://turborepo.com/docs' }, { label: 'Micro Frontends', url: 'https://micro-frontends.org' }, { label: 'Module Federation', url: 'https://module-federation.io' }] },
      { name: 'Next.js & RSC', path: '/frontend/nextjs-rsc', file: './content/front-end/nextjs-rsc-guide.md', officialDocs: [{ label: 'Next.js App Router', url: 'https://nextjs.org/docs/app' }, { label: 'React Server Components', url: 'https://react.dev/reference/rsc/server-components' }, { label: 'Next.js Auth Guide', url: 'https://nextjs.org/docs/app/guides/authentication' }] },
      { name: 'Modern CSS', path: '/frontend/modern-css', file: './content/front-end/modern-css-guide.md', officialDocs: [{ label: 'MDN CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' }, { label: 'web.dev — Learn CSS', url: 'https://web.dev/learn/css' }, { label: 'Baseline Status', url: 'https://webstatus.dev' }] },
      { name: 'Accessibility (a11y)', path: '/frontend/accessibility', file: './content/front-end/accessibility-guide.md', officialDocs: [{ label: 'WCAG 2.2 Quick Ref', url: 'https://www.w3.org/WAI/WCAG22/quickref/' }, { label: 'ARIA Authoring Practices', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/' }, { label: 'MDN ARIA', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA' }] },
      { name: 'Web Performance', path: '/frontend/web-performance', file: './content/front-end/web-performance-guide.md', officialDocs: [{ label: 'web.dev — Core Web Vitals', url: 'https://web.dev/articles/vitals' }, { label: 'Chrome UX Report', url: 'https://developer.chrome.com/docs/crux' }, { label: 'web-vitals library', url: 'https://github.com/GoogleChrome/web-vitals' }] },
      { name: 'Testing Strategy & E2E', path: '/frontend/testing-strategy', file: './content/front-end/testing-strategy-guide.md', officialDocs: [{ label: 'Playwright', url: 'https://playwright.dev/docs/intro' }, { label: 'Vitest', url: 'https://vitest.dev' }, { label: 'MSW', url: 'https://mswjs.io' }] },
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
    description: 'JavaScript, TypeScript, Regex & tricky interview problems',
    items: [
      { name: 'JavaScript Guide', path: '/javascript/guide', file: './content/javascript-and-typescript/javascript-guide.md', officialDocs: [{ label: 'MDN JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }] },
      { name: 'TypeScript Guide', path: '/javascript/typescript', file: './content/javascript-and-typescript/typescript-guide.md', officialDocs: [{ label: 'TypeScript', url: 'https://www.typescriptlang.org/docs' }] },
      { name: 'Regex Guide', path: '/javascript/regex', file: './content/javascript-and-typescript/regex-guide.md', officialDocs: [{ label: 'MDN — Regular Expressions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions' }, { label: 'regex101', url: 'https://regex101.com' }] },
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
    description: 'Node.js, Express, MongoDB, SQL, API Design, CORS, Web Security, OAuth & SSO, Microservices, Docker/K8s/CI-CD, Stripe & AI/LLM Engineering',
    items: [
      { name: 'Node.js Guide', path: '/backend/nodejs', file: './content/back-end/nodejs-guide.md', officialDocs: [{ label: 'Node.js', url: 'https://nodejs.org/docs/latest/api' }] },
      { name: 'Express.js Guide', path: '/backend/expressjs', file: './content/back-end/expressjs-guide.md', officialDocs: [{ label: 'Express.js', url: 'https://expressjs.com' }] },
      { name: 'MongoDB Guide', path: '/backend/mongodb', file: './content/back-end/mongodb-guide.md', officialDocs: [{ label: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual' }] },
      { name: 'API Design', path: '/backend/api-design', file: './content/back-end/api-design-guide.md', officialDocs: [{ label: 'OpenAPI Spec', url: 'https://swagger.io/specification' }] },
      { name: 'Database Schema', path: '/backend/database-schema', file: './content/back-end/database-schema-guide.md', officialDocs: [{ label: 'MongoDB Data Modeling', url: 'https://www.mongodb.com/docs/manual/data-modeling' }] },
      { name: 'SQL & Relational DBs', path: '/backend/sql', file: './content/back-end/sql-relational-databases-guide.md', officialDocs: [{ label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/current/' }, { label: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com' }, { label: 'PG Transaction Isolation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html' }] },
      { name: 'CORS', path: '/backend/cors', file: './content/back-end/cors-guide.md', officialDocs: [{ label: 'MDN CORS', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' }] },
      { name: 'Stripe Integration', path: '/backend/stripe', file: './content/back-end/stripe-guide.md', officialDocs: [{ label: 'Stripe API', url: 'https://stripe.com/docs/api' }, { label: 'Stripe Webhooks', url: 'https://stripe.com/docs/webhooks' }, { label: 'Stripe Payments', url: 'https://stripe.com/docs/payments' }] },
      { name: 'Web Security', path: '/backend/web-security', file: './content/back-end/web-security-guide.md', officialDocs: [{ label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' }, { label: 'OWASP Cheat Sheets', url: 'https://cheatsheetseries.owasp.org/' }, { label: 'web.dev — Strict CSP', url: 'https://web.dev/articles/strict-csp' }] },
      { name: 'OAuth & SSO', path: '/backend/oauth-sso', file: './content/back-end/oauth-sso-guide.md', officialDocs: [{ label: 'OAuth 2.0', url: 'https://oauth.net/2/' }, { label: 'OpenID Connect', url: 'https://openid.net/connect/' }, { label: 'RFC 6749', url: 'https://datatracker.ietf.org/doc/html/rfc6749' }] },
      { name: 'Microservices', path: '/backend/microservices', file: './content/back-end/microservices-guide.md', officialDocs: [{ label: 'microservices.io', url: 'https://microservices.io' }, { label: 'Martin Fowler — Microservices', url: 'https://martinfowler.com/articles/microservices.html' }] },
      { name: 'AI & LLM Engineering', path: '/backend/ai-llm-engineering', file: './content/back-end/ai-llm-engineering-guide.md', officialDocs: [{ label: 'Claude Docs', url: 'https://docs.claude.com/en/docs/overview' }, { label: 'OWASP LLM Top 10', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' }, { label: 'Model Context Protocol', url: 'https://modelcontextprotocol.io' }] },
      { name: 'Docker, K8s & CI/CD', path: '/backend/docker-kubernetes', file: './content/back-end/docker-kubernetes-cicd-guide.md', officialDocs: [{ label: 'Dockerfile Best Practices', url: 'https://docs.docker.com/build/building/best-practices/' }, { label: 'Kubernetes Concepts', url: 'https://kubernetes.io/docs/concepts/' }, { label: 'The Twelve-Factor App', url: 'https://12factor.net' }] },
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
    description: 'Scalability, load balancing, caching, frontend system design, low-level design (LLD) & architecture patterns',
    items: [
      { name: 'System Design Guide', path: '/system-design/guide', file: './content/system-design/system-design-guide.md', officialDocs: [] },
      { name: 'Frontend System Design', path: '/system-design/frontend', file: './content/system-design/frontend-system-design-guide.md', officialDocs: [{ label: 'GreatFrontEnd', url: 'https://www.greatfrontend.com' }, { label: 'WAI-ARIA Authoring Practices', url: 'https://www.w3.org/WAI/ARIA/apg/' }] },
      { name: 'Low-Level Design (LLD)', path: '/system-design/low-level-design', file: './content/system-design/low-level-design-guide.md', officialDocs: [{ label: 'Refactoring Guru — Patterns', url: 'https://refactoring.guru/design-patterns' }, { label: 'Refactoring Guru — Code Smells', url: 'https://refactoring.guru/refactoring/smells' }] },
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

