import { describe, it, expect } from 'vitest';
import { templateFilterReducer, type TemplateFilterState } from './useTemplateFilters';

const base: TemplateFilterState = {
  search: '', tag: 'all', category: 'all', mode: 'templates', pattern: 'all', difficulty: 'all',
};
/** A state with the scope-specific filters actually applied. */
const filtered: TemplateFilterState = {
  ...base, mode: 'challenges', tag: 'JS', pattern: 'Two Pointer', difficulty: 'Medium', search: 'sum', category: 'Arrays',
};

describe('templateFilterReducer — the shipped bug cannot recur', () => {
  it('changing the tag clears pattern and difficulty', () => {
    const next = templateFilterReducer(filtered, { type: 'tag', value: 'React' });
    expect(next.tag).toBe('React');
    expect(next.pattern).toBe('all');
    expect(next.difficulty).toBe('all');
  });

  it('changing the mode clears pattern and difficulty', () => {
    const next = templateFilterReducer(filtered, { type: 'mode', value: 'templates' });
    expect(next.mode).toBe('templates');
    expect(next.pattern).toBe('all');
    expect(next.difficulty).toBe('all');
  });

  it('reset returns everything to the initial state', () => {
    expect(templateFilterReducer(filtered, { type: 'reset' })).toEqual(base);
  });

  it('no sequence of tag/mode changes can leave a stale pattern', () => {
    let s = filtered;
    for (const a of [
      { type: 'mode', value: 'challenges' }, { type: 'tag', value: 'React' },
      { type: 'mode', value: 'blank' }, { type: 'tag', value: 'JS' },
    ] as const) {
      s = templateFilterReducer(s, a);
      expect(s.pattern).toBe('all');
      expect(s.difficulty).toBe('all');
    }
  });
});

describe('templateFilterReducer — independent fields', () => {
  it('search does not disturb the others', () => {
    const next = templateFilterReducer(filtered, { type: 'search', value: 'two' });
    expect(next.search).toBe('two');
    expect(next.pattern).toBe('Two Pointer');
    expect(next.difficulty).toBe('Medium');
  });

  it('category does not clear pattern', () => {
    const next = templateFilterReducer(filtered, { type: 'category', value: 'Strings' });
    expect(next.category).toBe('Strings');
    expect(next.pattern).toBe('Two Pointer');
  });

  it('pattern and difficulty set independently of each other', () => {
    const a = templateFilterReducer(base, { type: 'pattern', value: 'Stack' });
    expect(a.pattern).toBe('Stack');
    expect(a.difficulty).toBe('all');
    const b = templateFilterReducer(a, { type: 'difficulty', value: 'Hard' });
    expect(b.pattern).toBe('Stack');
    expect(b.difficulty).toBe('Hard');
  });

  it('is pure — the input state is never mutated', () => {
    const snapshot = { ...filtered };
    templateFilterReducer(filtered, { type: 'tag', value: 'React' });
    expect(filtered).toEqual(snapshot);
  });
});
