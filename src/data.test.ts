import { describe, it, expect } from 'vitest';
import { extractQuestions, slugify, getAllQuestions, menuStructure, cheatSheets, readMinFor } from './data';

// These tests exist because `tsc` cannot see any of this. Three defects shipped
// through a clean typecheck: a Promise reaching `.filter()`, 344 colliding
// question ids, and broken in-page anchors. Each has a test here now.

describe('slugify', () => {
  it('lower-cases and hyphenates', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('collapses runs of separators — the reason GitHub-style `a--b` anchors broke', () => {
    expect(slugify('Foo -- Bar')).toBe('foo-bar');
    expect(slugify('A  &  B')).toBe('a-b');
  });

  it('is stable and idempotent', () => {
    const once = slugify('5.2 State Update Rules');
    expect(slugify(once)).toBe(once);
  });
});

describe('extractQuestions — standard `**QN:**` pattern', () => {
  const md = `
## Interview Questions

**Q1: What is a closure?**

A function bundled with its lexical scope.

---

**Q2: What is hoisting?**

Declarations are processed before execution.

---
`;
  it('extracts every question', () => {
    const qs = extractQuestions(md, 'Test Guide');
    expect(qs).toHaveLength(2);
    expect(qs[0].question).toBe('What is a closure?');
    expect(qs[0].answer).toContain('lexical scope');
    expect(qs[0].guide).toBe('Test Guide');
    expect(qs[0].type).toBe('conceptual');
  });

  it('stops the answer at the `---` separator, not at the next question', () => {
    const qs = extractQuestions(md, 'G');
    expect(qs[0].answer).not.toContain('hoisting');
  });

  it('drops a question whose answer is too short to be real', () => {
    expect(extractQuestions('**Q1: Stub?**\n\nno\n\n---\n', 'G')).toHaveLength(0);
  });
});

describe('extractQuestions — id uniqueness (the 344-collision bug)', () => {
  // Most guides hold TWO independent Q sequences (interview + "Tricky Output
  // Questions"), each restarting at Q1. Ids are the localStorage keys for SM-2
  // scheduling, so a collision made two questions share one review record:
  // answering one silently rescheduled the other.
  const twoSequences = `
## Interview Questions

**Q1: First sequence question one?**

An answer long enough to count as real content.

---

**Q2: First sequence question two?**

Another answer long enough to count.

---

## Tricky Output Questions

**Q1: Second sequence question one?**

A third answer long enough to count.

---

**Q2: Second sequence question two?**

A fourth answer long enough to count.

---
`;

  it('produces unique ids across both sequences', () => {
    const qs = extractQuestions(twoSequences, 'Dup Guide');
    expect(qs).toHaveLength(4);
    expect(new Set(qs.map(q => q.id)).size).toBe(4);
  });

  it('keeps the FIRST occurrence id unchanged so existing review history survives', () => {
    const qs = extractQuestions(twoSequences, 'Dup Guide');
    expect(qs[0].id).toBe('Dup Guide-q1');
    expect(qs[1].id).toBe('Dup Guide-q2');
  });

  it('suffixes only the later duplicates', () => {
    const qs = extractQuestions(twoSequences, 'Dup Guide');
    expect(qs[2].id).toBe('Dup Guide-q1-2');
    expect(qs[3].id).toBe('Dup Guide-q2-2');
  });
});

describe('getAllQuestions — the async contract', () => {
  it('returns a Promise, NOT an array', () => {
    // The Review page blanked because a cast handed this Promise straight to
    // something that calls `.filter()`.
    const result = getAllQuestions();
    expect(result).toBeInstanceOf(Promise);
    expect((result as unknown as { filter?: unknown }).filter).toBeUndefined();
  });

  it('resolves to a non-empty array of well-formed questions', async () => {
    const qs = await getAllQuestions();
    expect(Array.isArray(qs)).toBe(true);
    expect(qs.length).toBeGreaterThan(1000);
    for (const q of qs) {
      expect(typeof q.id).toBe('string');
      expect(q.id.length).toBeGreaterThan(0);
      expect(typeof q.question).toBe('string');
      expect(typeof q.answer).toBe('string');
      expect(typeof q.guide).toBe('string');
    }
  });

  it('has no duplicate ids across the whole corpus', async () => {
    const qs = await getAllQuestions();
    const seen = new Map<string, number>();
    for (const q of qs) seen.set(q.id, (seen.get(q.id) ?? 0) + 1);
    expect([...seen.entries()].filter(([, n]) => n > 1)).toEqual([]);
  });
});

describe('content registry integrity', () => {
  it('every registered guide has reading-time metadata', () => {
    const items = menuStructure.flatMap(s => s.items ?? []);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(readMinFor(item.file), `${item.name} (${item.file})`).toBeGreaterThan(0);
    }
  });

  it('every cheat sheet has reading-time metadata', () => {
    for (const cs of cheatSheets) {
      expect(readMinFor(cs.file), cs.name).toBeGreaterThan(0);
    }
  });

  it('guide routes are unique', () => {
    const paths = [...menuStructure.flatMap(s => s.items ?? []).map(i => i.path), ...cheatSheets.map(c => c.path)];
    expect(new Set(paths).size).toBe(paths.length);
  });
});
