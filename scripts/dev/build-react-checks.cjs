// Usage: node scripts/dev/build-react-checks.cjs <checks.json>...
// Merges draft behaviour-check files (verified with
// REACT_CHECKS_FILE=<file> npx vitest run src/data/playground/reactChallengeChecks.test.tsx)
// into src/data/playground/reactChecks.ts, in the playground's template order.
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '../..');
const index = JSON.parse(fs.readFileSync(path.join(REPO, 'src/generated/playground-index.json'), 'utf8'));
const order = index.categories.filter((c) => c.kind === 'challenge' && c.tag === 'React').flatMap((c) => c.templates.map((t) => t.name));
const merged = {};
for (const f of process.argv.slice(2)) Object.assign(merged, JSON.parse(fs.readFileSync(f, 'utf8')));
const unknown = Object.keys(merged).filter((n) => !order.includes(n));
if (unknown.length) { console.error('not React challenges:', unknown); process.exit(1); }
const names = order.filter((n) => merged[n]);
const body = names.map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(merged[n], null, 2).replace(/\n/g, '\n  ')},`).join('\n');
const file = path.join(REPO, 'src/data/playground/reactChecks.ts');
const src = fs.readFileSync(file, 'utf8');
const start = src.indexOf('export const reactChecks');
fs.writeFileSync(file, src.slice(0, start) + `export const reactChecks: Record<string, ReactCheck[]> = {\n${body}\n};\n`);
console.log(`wrote ${names.length} templates, ${names.reduce((a, n) => a + merged[n].length, 0)} checks`);
