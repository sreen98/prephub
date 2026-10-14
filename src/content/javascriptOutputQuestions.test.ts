import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Every JavaScript Output question (javascript-tricky-questions.md) prints exactly its Output
 * block. Each snippet runs in its own `node` process: the event-loop questions depend on Node's
 * real loop, and Vitest's worker would add timers and queues of its own. A snippet that prints
 * nothing fails, and the timing-sensitive ones run three times, so a race can't pass by luck.
 */
const GUIDE = readFileSync('src/content/javascript-and-typescript/javascript-tricky-questions.md', 'utf8').replace(/\r\n/g, '\n');
const COUNT = [...GUIDE.matchAll(/^\*\*Q(\d+):/gm)].length;

/** Run as an ES module: top-level `await` (Q16), and top-level `this` undefined as in Try it (Q31). */
const AS_MODULE = new Set([16, 31]);
/** Not runnable in this Node: the reason is the skip label. */
const SKIP: Record<number, string> = {
  15: 'Temporal is not in Node yet; the dates follow the spec (Jan 31 + 1 month = Feb 28; Date rolls to Mar 3)',
  60: 'a two-file example, run separately below',
};
const REPEAT = new Set([9, 11, 16, 17, 52, 53, 54, 55, 56, 57, 58, 59]);

function question(n: number): { code: string; output: string } {
  const start = GUIDE.indexOf(`**Q${n}:`);
  const next = GUIDE.indexOf(`**Q${n + 1}:`, start);
  const body = GUIDE.slice(start, next === -1 ? GUIDE.indexOf('### Key Rules') : next);
  const code = /```(?:js|text)\n([\s\S]*?)```/.exec(body)?.[1];
  const after = body.slice(body.search(/\*\*Output(?::\*\*|\*\* \()/));
  const output = /^[^\n]*\n```[a-z]*\n([\s\S]*?)```/.exec(after)?.[1] ?? /^\*\*Output:\*\* `([^`]*)`/.exec(after)?.[1];
  if (start === -1 || code === undefined || output === undefined) throw new Error(`Q${n}: code or Output block not found`);
  return { code, output: output.trimEnd() };
}

let dir = '';
beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'prephub-output-questions-')); });
afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

function runNode(file: string, source: string): string {
  const path = join(dir, file);
  writeFileSync(path, source);
  const r = spawnSync(process.execPath, ['--no-warnings', path], { encoding: 'utf8', timeout: 15_000 });
  if (r.status !== 0) throw new Error(`${file} exited ${r.status}: ${r.stderr}`);
  const out = r.stdout.replace(/\r\n/g, '\n').trimEnd();
  expect(out.length, `${file} printed nothing`).toBeGreaterThan(0);
  return out;
}

describe('JavaScript Output questions print exactly their Output blocks (real Node process)', () => {
  it('has the expected number of questions', () => {
    expect(COUNT).toBe(60);
  });

  const runnable = Array.from({ length: COUNT }, (_, i) => i + 1).filter((n) => !(n in SKIP));
  it.each(runnable)('Q%i', (n) => {
    const { code, output } = question(n);
    const ext = AS_MODULE.has(n) || /^import /m.test(code) ? 'mjs' : 'cjs';
    for (let i = 0; i < (REPEAT.has(n) ? 3 : 1); i++) expect(runNode(`q${n}-${i}.${ext}`, code)).toBe(output);
  });

  it('Q60: the same two lines print promise-first as an ES module and nextTick-first as CommonJS', () => {
    const { code, output } = question(60);
    const lines = code.split('\n').filter((l) => l.trim() && !l.startsWith('//')).join('\n') + '\n';
    expect(runNode('order.mjs', lines)).toBe('promise\nnextTick');
    expect(runNode('order.cjs', lines)).toBe('nextTick\npromise');
    expect(output).toBe('node order.mjs   →  promise, then nextTick\nnode order.cjs   →  nextTick, then promise');
  });
});
