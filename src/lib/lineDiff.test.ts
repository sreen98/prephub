import { describe, it, expect } from 'vitest';
import { diffLines, diffStats, pairRows } from './lineDiff';

describe('diffLines', () => {
  it('aligns equal lines and marks the rest', () => {
    const rows = diffLines('a\nb\nc', 'a\nx\nc');
    expect(rows.map((r) => r.kind)).toEqual(['same', 'added', 'removed', 'same']);
    expect(diffStats(rows)).toEqual({ same: 2, removed: 1, added: 1 });
  });

  it('ignores indentation and spacing differences when matching', () => {
    expect(diffLines('  return  a + b;', 'return a + b;')[0].kind).toBe('same');
  });

  it('handles an empty side', () => {
    expect(diffLines('', 'a\nb').filter((r) => r.kind === 'added')).toHaveLength(2);
  });

  it('is minimal: an inserted block does not disturb the lines around it', () => {
    const rows = diffLines('f() {\n  return 1;\n}', 'f() {\n  const x = 1;\n  log(x);\n  return 1;\n}');
    expect(rows.filter((r) => r.kind === 'same')).toHaveLength(3);
    expect(rows.filter((r) => r.kind === 'added')).toHaveLength(2);
  });
});

describe('pairRows', () => {
  it('puts a changed line opposite its replacement on one row', () => {
    const paired = pairRows(diffLines('a\nold\nc', 'a\nnew\nc'));
    expect(paired).toHaveLength(3);
    expect(paired[1]).toEqual({ left: { text: 'old', no: 2, changed: true }, right: { text: 'new', no: 2, changed: true } });
  });
});
