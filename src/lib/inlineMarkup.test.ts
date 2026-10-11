import { describe, it, expect } from 'vitest';
import { parseInline } from './inlineMarkup';

describe('parseInline', () => {
  it('splits text, code and bold', () => {
    expect(parseInline('use `let`, **not** var')).toEqual([
      { kind: 'text', value: 'use ' },
      { kind: 'code', value: 'let' },
      { kind: 'text', value: ', ' },
      { kind: 'bold', children: [{ kind: 'text', value: 'not' }] },
      { kind: 'text', value: ' var' },
    ]);
  });

  it('parses code spans inside bold', () => {
    expect(parseInline('**the `nextTick` queue**')).toEqual([
      { kind: 'bold', children: [
        { kind: 'text', value: 'the ' },
        { kind: 'code', value: 'nextTick' },
        { kind: 'text', value: ' queue' },
      ] },
    ]);
  });

  it('keeps ** inside a code span literal', () => {
    expect(parseInline('`a ** b`')).toEqual([{ kind: 'code', value: 'a ** b' }]);
  });

  it('leaves unclosed markers as plain text', () => {
    expect(parseInline('**open and `tick')).toEqual([{ kind: 'text', value: '**open and `tick' }]);
  });

  it('returns nothing for an empty string', () => {
    expect(parseInline('')).toEqual([]);
  });
});
