import { describe, it, expect } from 'vitest';
import { checkAnswer, normaliseCell } from './checkAnswer';

describe('normaliseCell — engines disagree about representation', () => {
  it('treats a numeric string as its number (PGlite returns numerics as strings)', () => {
    expect(normaliseCell('150000')).toBe(normaliseCell(150000));
    expect(normaliseCell('3')).toBe(3);
  });

  it('reduces a Postgres DATE timestamp to its day', () => {
    expect(normaliseCell('2019-03-01T00:00:00.000Z')).toBe('2019-03-01');
  });

  it('converts a Date object to the same day string', () => {
    expect(normaliseCell(new Date('2019-03-01T00:00:00Z'))).toBe('2019-03-01');
  });

  it('handles bigint from count(*)', () => {
    expect(normaliseCell(4n)).toBe(4);
  });

  it('treats null and undefined alike', () => {
    expect(normaliseCell(undefined)).toBeNull();
    expect(normaliseCell(null)).toBeNull();
  });

  it('sorts object keys so key order never matters', () => {
    expect(normaliseCell({ b: 1, a: 2 })).toEqual(normaliseCell({ a: 2, b: 1 }));
  });

  it('leaves a non-numeric string alone but trims it', () => {
    expect(normaliseCell('  Ada ')).toBe('Ada');
  });
});

describe('checkAnswer — correct answers must not be rejected', () => {
  const expected = [{ dept: 'Eng', total: 3 }, { dept: 'Ops', total: 1 }];

  it('accepts an exact match', () => {
    expect(checkAnswer(expected, expected, false).correct).toBe(true);
  });

  it('accepts columns in a different order', () => {
    const actual = [{ total: 3, dept: 'Eng' }, { total: 1, dept: 'Ops' }];
    expect(checkAnswer(actual, expected, false).correct).toBe(true);
  });

  it('accepts rows in a different order when ordering is not asked for', () => {
    const actual = [{ dept: 'Ops', total: 1 }, { dept: 'Eng', total: 3 }];
    expect(checkAnswer(actual, expected, false).correct).toBe(true);
  });

  it('accepts Postgres numeric strings against numbers', () => {
    const actual = [{ dept: 'Eng', total: '3' }, { dept: 'Ops', total: '1' }];
    expect(checkAnswer(actual, expected, false).correct).toBe(true);
  });

  it('accepts an empty result when empty is correct', () => {
    expect(checkAnswer([], [], false).correct).toBe(true);
  });
});

describe('checkAnswer — wrong answers must be rejected, with a useful reason', () => {
  const expected = [{ dept: 'Eng', total: 3 }, { dept: 'Ops', total: 1 }];

  it('rejects too many rows and says the filter is leaking', () => {
    const r = checkAnswer([...expected, { dept: 'Sales', total: 9 }], expected, false);
    expect(r.correct).toBe(false);
    expect(r.reason).toMatch(/Expected 2 rows, got 3/);
    expect(r.reason).toMatch(/extra rows through/);
  });

  it('rejects too few rows and points at the filter or JOIN', () => {
    const r = checkAnswer([expected[0]], expected, false);
    expect(r.correct).toBe(false);
    expect(r.reason).toMatch(/rows are being excluded/);
  });

  it('names a missing column', () => {
    const r = checkAnswer([{ dept: 'Eng' }, { dept: 'Ops' }], expected, false);
    expect(r.correct).toBe(false);
    expect(r.reason).toContain('`total`');
    expect(r.reason).toMatch(/missing/);
  });

  it('names an unexpected extra column', () => {
    const actual = [{ dept: 'Eng', total: 3, extra: 1 }, { dept: 'Ops', total: 1, extra: 2 }];
    const r = checkAnswer(actual, expected, false);
    expect(r.reason).toMatch(/unexpected/);
    expect(r.reason).toContain('`extra`');
  });

  it('rejects a wrong value', () => {
    const r = checkAnswer([{ dept: 'Eng', total: 4 }, { dept: 'Ops', total: 1 }], expected, false);
    expect(r.correct).toBe(false);
    expect(r.reason).toMatch(/values are wrong/);
  });

  it('rejects wrong row order ONLY when ordering was asked for', () => {
    const reversed = [expected[1], expected[0]];
    expect(checkAnswer(reversed, expected, false).correct).toBe(true);   // order free
    const r = checkAnswer(reversed, expected, true);                      // order graded
    expect(r.correct).toBe(false);
    expect(r.reason).toMatch(/ORDER BY/);
    expect(r.detail?.index).toBe(0);
  });

  it('compares as a multiset, so duplicate rows must match in count', () => {
    const dup = [{ a: 1 }, { a: 1 }];
    expect(checkAnswer([{ a: 1 }, { a: 2 }], dup, false).correct).toBe(false);
    expect(checkAnswer(dup, dup, false).correct).toBe(true);
  });
});
