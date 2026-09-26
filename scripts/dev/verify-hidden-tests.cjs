// Usage: node scripts/dev/verify-hidden-tests.cjs <in.json> [out.json]
// <in.json> is { "<challenge name>": [ { "label": "...", "run": "..." } ] }.
// For every test: runs the REFERENCE solution + the snippet through the same
// harness the playground uses, and records what it prints as `output`. Then runs
// the challenge's STUB (its template code) the same way; a test whose output the
// stub already produces tests nothing and is reported. Writes the verified tests
// (with `output`) to out.json, or prints a summary when out.json is omitted.
const fs = require('fs'), path = require('path'), vm = require('vm'), esbuild = require('esbuild');
const REPO = path.resolve(__dirname, '../..');
// A stub's own async test code can reject with nobody listening; that is the
// stub being unfinished, not a verifier failure.
process.on('unhandledRejection', () => {});
function load(rel) {
  const out = esbuild.transformSync(fs.readFileSync(path.join(REPO, rel), 'utf8'), { loader: 'ts', format: 'cjs' }).code;
  const m = { exports: {} }; new Function('module', 'exports', 'require', out)(m, m.exports, require); return m.exports;
}
const { buildHiddenHarness, HIDDEN_MARKER, harnessBudgetMs } = load('src/lib/hiddenTests.ts');
const { playgroundSolutions } = load('src/data/playground/playgroundSolutions.ts');
const { allTemplates } = load('src/data/playground/playgroundTemplates.ts');
const byName = new Map(allTemplates.map((t) => [t.name, t]));

async function runAll(program, tests) {
  const muted = { log() {}, info() {}, warn() {}, error() {}, debug() {} };
  let marker = null;
  const top = { ...muted, log: (...a) => { const s = a.join(' '); if (s.startsWith(HIDDEN_MARKER)) marker = s; } };
  const ctx = vm.createContext({ console: top, setTimeout, clearTimeout, setInterval, clearInterval, Promise, queueMicrotask, structuredClone });
  let threw = null;
  try { vm.runInContext(program + buildHiddenHarness(tests), ctx, { timeout: 3000 }); } catch (e) { threw = String(e && e.message || e); }
  const deadline = Date.now() + harnessBudgetMs(tests) + 3000;
  while (!marker && !threw && Date.now() < deadline) await new Promise((r) => setTimeout(r, 25));
  return { threw, results: marker ? JSON.parse(marker.slice(HIDDEN_MARKER.length)) : null };
}

(async () => {
  const [inFile, outFile] = process.argv.slice(2);
  const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const verified = {}; let problems = 0, kept = 0;
  for (const [name, tests] of Object.entries(data)) {
    const tpl = byName.get(name), sol = playgroundSolutions[name];
    if (!tpl || tpl.kind !== 'challenge') { console.log('NOT A CHALLENGE:', name); problems++; continue; }
    if (!sol) { console.log('NO REFERENCE SOLUTION:', name); problems++; continue; }
    const ref = await runAll(sol, tests);
    if (!ref.results) { console.log(`REFERENCE DID NOT FINISH: ${name}${ref.threw ? ' — ' + ref.threw : ''}`); problems++; continue; }
    const stub = await runAll(tpl.code, tests);
    verified[name] = [];
    tests.forEach((t, i) => {
      const r = ref.results.find((x) => x.i === i);
      if (r.err) { console.log(`REFERENCE THROWS: ${name} :: ${t.label} — ${r.err}`); problems++; return; }
      if (r.out === '') { console.log(`PRINTS NOTHING: ${name} :: ${t.label}`); problems++; return; }
      const s = stub.results && stub.results.find((x) => x.i === i);
      if (s && !s.err && s.out === r.out) { console.log(`STUB ALREADY PASSES (tests nothing): ${name} :: ${t.label}`); problems++; return; }
      const entry = { label: t.label, run: t.run, output: r.out };
      if (t.waitMs) entry.waitMs = t.waitMs;
      verified[name].push(entry); kept++;
    });
  }
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(verified, null, 1));
  console.log(`kept ${kept} tests across ${Object.keys(verified).length} challenges, ${problems} problems`);
})();
