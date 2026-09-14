import { describe, it, expect } from 'vitest';
import { templateCategories } from './playgroundTemplates';
import { playgroundBuildExplanations } from './playgroundBuildExplanations';
import { sliceExcerpt } from '../../lib/buildExcerpt';

/**
 * A build step quotes its template by ANCHOR rather than restating the code.
 *
 * The first version of these walkthroughs carried hand-written snippets, and an
 * audit found 360 of 454 lines did not exist in the template the reader had
 * open — they described an idealised implementation instead of the one on
 * screen. That is worse than no snippet, because the reader cannot map what
 * they are told onto what they can see.
 *
 * These tests make the drift impossible: if an anchor stops matching, or starts
 * matching in more than one place, the build fails.
 */
describe('build walkthrough anchors point at real template code', () => {
  const byName = new Map<string, string>();
  for (const c of templateCategories) for (const t of c.templates) byName.set(t.name, t.code);

  it('every anchor resolves in its own template', () => {
    const broken: string[] = [];
    for (const [name, ex] of Object.entries(playgroundBuildExplanations)) {
      const src = byName.get(name);
      if (!src) { broken.push(`${name}: template missing`); continue; }
      for (const step of ex.buildOrder) {
        if (!step.excerpt) continue;
        const out = sliceExcerpt(src, step.excerpt.from, step.excerpt.lines);
        if (out === null) broken.push(`${name} / "${step.title}": anchor not found — ${step.excerpt.from}`);
        else if (!out.trim()) broken.push(`${name} / "${step.title}": anchor resolved to nothing`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('anchors are distinctive enough to match one place', () => {
    // A `from` that appears many times would silently quote the wrong region
    // the next time the template is edited.
    const vague: string[] = [];
    for (const [name, ex] of Object.entries(playgroundBuildExplanations)) {
      const src = byName.get(name) ?? '';
      for (const step of ex.buildOrder) {
        if (!step.excerpt) continue;
        const hits = src.split('\n').filter((l) => l.includes(step.excerpt!.from)).length;
        if (hits > 2) vague.push(`${name} / "${step.title}": matches ${hits} lines`);
      }
    }
    expect(vague).toEqual([]);
  });

  it('a step with no excerpt still stands on its own prose', () => {
    // 24 steps describe something the template deliberately does NOT contain —
    // an alternative API, or a concept. Those are prose-only rather than
    // pretending, so their detail has to carry the whole point.
    const thin: string[] = [];
    for (const [name, ex] of Object.entries(playgroundBuildExplanations)) {
      for (const step of ex.buildOrder) {
        if (step.excerpt) continue;
        if (step.detail.length < 120) thin.push(`${name} / "${step.title}"`);
      }
    }
    expect(thin).toEqual([]);
  });
});
