import { describe, it, expect } from 'vitest';
import { templateCategories } from './playgroundTemplates';
import { playgroundBuildExplanations } from './playgroundBuildExplanations';

/**
 * Interview prose for a React machine-coding challenge (what is graded, the
 * design choice, follow-ups, things to try) lives in the Tips dialog, which
 * reads `graded` and `tips` from the build explanation. In the template it was
 * 10-40 comment lines that pushed the code off the first screen, and it
 * repeated the graded points word for word. Comments that explain the line
 * below them stay in the code.
 */
const PROSE_HEADING = /WHAT'S BEING GRADED|FOLLOW-UPS|\/\/ TRY IT|TRY TO BREAK IT|INTERVIEWERS? (ASK|ACTUALLY|IS LISTENING)|WHICH (TOOL|ANIMATION)|OR POLLING\?/;

describe('React machine-coding notes live in Tips, not in the code', () => {
  const machineCoding = templateCategories.find(c => c.label === 'React Machine Coding')!.templates;

  it('no template carries an interview-notes heading in its comments', () => {
    const offenders = machineCoding
      .filter(t => t.code.split('\n').some(l => /^\s*\/\//.test(l) && PROSE_HEADING.test(l)))
      .map(t => t.name);
    expect(offenders).toEqual([]);
  });

  it('every challenge has graded points, and every tip section has a title and points', () => {
    const bad: string[] = [];
    for (const t of machineCoding) {
      const ex = playgroundBuildExplanations[t.name];
      if (!ex || ex.graded.length === 0) { bad.push(`${t.name}: no graded points`); continue; }
      const titles = new Set<string>();
      for (const s of ex.tips ?? []) {
        if (!s.title.trim() || s.points.length === 0) bad.push(`${t.name}: empty section "${s.title}"`);
        if (titles.has(s.title)) bad.push(`${t.name}: duplicate section "${s.title}"`);
        titles.add(s.title);
        if (new Set(s.points).size !== s.points.length) bad.push(`${t.name}: duplicate point in "${s.title}"`);
      }
    }
    expect(bad).toEqual([]);
  });
});
