// Usage: node scripts/dev/gen-guide-splits.cjs
// Generates src/data/guideSplits.ts: for each guide that was split into a series, where every
// moved heading anchor now lives, plus the facts the question-id migration needs.
// Anchors come from the ORIGINAL single-file guide; an anchor is kept only if it still exists
// in its new file and no longer exists in the core file (those are reported).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// The last commit before any split (v1.7.12). Every original single-file guide is read from it.
const BASE = 'bc66290';
const ROOT = path.join(__dirname, '../..');
const original = (rel) => execSync(`git show ${BASE}:src/content/${rel}`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const norm = (s) => s.replace(/\r\n/g, '\n');
const slugify = (t) => t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const anchorsOf = (md) => {
  const out = new Set(); let fence = false;
  for (const l of md.split('\n')) {
    if (/^\s*```/.test(l)) fence = !fence;
    if (fence) continue;
    const m = /^#{1,6}\s+(.*)$/.exec(l);
    if (m) out.add(slugify(m[1].replace(/`/g, '')));
  }
  return out;
};
const section = (md, from, to) => {
  const a = md.indexOf(`\n## ${from}.`);
  const b = to ? md.indexOf(`\n## ${to}.`) : md.indexOf('\n## References');
  if (a < 0 || b < 0) throw new Error(`section ${from} not found`);
  return md.slice(a, b);
};
const read = (p) => norm(fs.readFileSync(p, 'utf8'));
const cur = (rel) => read(path.join(ROOT, 'src/content', rel));

const SPLITS = [
  {
    key: 'react', oldName: 'React Guide', oldRoute: '/frontend/react', original: norm(original('front-end/react-guide.md')),
    coreFile: 'front-end/react-guide.md', qaMax: 86,
    qa: { name: 'React Interview Questions', route: '/frontend/react-interview-questions' },
    tricky: { name: 'React Tricky Questions', route: '/frontend/react-tricky-questions' },
    parts: [
      { from: 13, to: 15, name: 'React Performance & Internals', route: '/frontend/react-performance', file: 'front-end/react-performance-guide.md' },
      { from: 15, to: 17, name: 'React 19 & Patterns', route: '/frontend/react-19-patterns', file: 'front-end/react-19-patterns-guide.md' },
      { from: 17, to: 18, name: 'React Interview Questions', route: '/frontend/react-interview-questions', file: 'front-end/react-interview-questions.md' },
      { from: 18, to: null, name: 'React Tricky Questions', route: '/frontend/react-tricky-questions', file: 'front-end/react-tricky-questions.md' },
    ],
  },
  {
    key: 'javascript', oldName: 'JavaScript Guide', oldRoute: '/javascript/guide', original: norm(original('javascript-and-typescript/javascript-guide.md')),
    coreFile: 'javascript-and-typescript/javascript-guide.md', qaMax: 45,
    qa: { name: 'JavaScript Interview Questions', route: '/javascript/interview-questions' },
    tricky: { name: 'JavaScript Tricky Questions', route: '/javascript/tricky-questions' },
    parts: [
      { from: 15, to: 16, name: 'JavaScript Interview Questions', route: '/javascript/interview-questions', file: 'javascript-and-typescript/javascript-interview-questions.md' },
      { from: 16, to: null, name: 'JavaScript Tricky Questions', route: '/javascript/tricky-questions', file: 'javascript-and-typescript/javascript-tricky-questions.md' },
    ],
  },
  {
    key: 'typescript', oldName: 'TypeScript Guide', oldRoute: '/javascript/typescript', original: norm(original('javascript-and-typescript/typescript-guide.md')),
    coreFile: 'javascript-and-typescript/typescript-guide.md', qaMax: 29,
    qa: { name: 'TypeScript Interview Questions', route: '/javascript/typescript-interview-questions' },
    tricky: { name: 'TypeScript Tricky Questions', route: '/javascript/typescript-tricky-questions' },
    parts: [
      { from: 15, to: 16, name: 'TypeScript Interview Questions', route: '/javascript/typescript-interview-questions', file: 'javascript-and-typescript/typescript-interview-questions.md' },
      { from: 16, to: null, name: 'TypeScript Tricky Questions', route: '/javascript/typescript-tricky-questions', file: 'javascript-and-typescript/typescript-tricky-questions.md' },
    ],
  },
];

const q = (s) => `'${s.replace(/'/g, "\\'")}'`;
let out = `/**
 * Guides that were split into a series (React in v1.7.14; JavaScript and TypeScript in v1.7.15).
 * Everything here exists so that nothing a user saved before a split is lost; see
 * src/lib/guideSplitMigration.ts. GENERATED from the original single-file guides by
 * scripts/dev/gen-guide-splits.cjs. Renaming a heading in a moved section means updating its
 * entry in \`movedAnchors\`; guideSplitMigration.test.ts pins every entry to the files.
 */

export interface GuideSplit {
  /** Guide name and route before the split. Question ids were \`<oldName>-qN\`. */
  oldName: string;
  oldRoute: string;
  /**
   * How many Interview Q&A questions the deployed single guide had. Its Tricky questions
   * restarted at Q1, so a Tricky Qn got the dedupe suffix (\`-qN-2\`) only when n <= qaMax;
   * a Tricky question numbered above qaMax kept the plain \`-qN\` id.
   */
  qaMax: number;
  qa: { name: string; route: string };
  tricky: { name: string; route: string };
  /** Guide name for each route a section moved to. */
  routeNames: Readonly<Record<string, string>>;
  /** Heading anchor -> the route that now owns it. */
  movedAnchors: Readonly<Record<string, string>>;
}

export const GUIDE_SPLITS: readonly GuideSplit[] = [
`;
const report = [];
for (const s of SPLITS) {
  const core = anchorsOf(cur(s.coreFile));
  const moved = {};
  for (const p of s.parts) {
    const target = anchorsOf(cur(p.file));
    for (const a of anchorsOf(section(s.original, p.from, p.to))) {
      if (core.has(a)) continue;                       // still on the core page: nothing moved
      if (!target.has(a)) { report.push(`${s.key}: '${a}' was in §${p.from} but is no longer in ${p.file}`); continue; }
      if (!moved[a]) moved[a] = p.route;
    }
  }
  const routeNames = s.parts.map((p) => `      ${q(p.route)}: ${q(p.name)},`).join('\n');
  const anchors = Object.keys(moved).sort().map((a) => `      ${q(a)}: ${q(moved[a])},`).join('\n');
  out += `  {
    oldName: ${q(s.oldName)},
    oldRoute: ${q(s.oldRoute)},
    qaMax: ${s.qaMax},
    qa: { name: ${q(s.qa.name)}, route: ${q(s.qa.route)} },
    tricky: { name: ${q(s.tricky.name)}, route: ${q(s.tricky.route)} },
    routeNames: {
${routeNames}
    },
    movedAnchors: {
${anchors}
    },
  },
`;
  console.log(`${s.key}: ${Object.keys(moved).length} moved anchors`);
}
out += '];\n';
fs.writeFileSync(path.join(ROOT, 'src/data/guideSplits.ts'), out);
if (report.length) { console.log('Anchors not carried (heading gone from its new file):'); report.forEach((r) => console.log('  ' + r)); }
