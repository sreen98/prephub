// @vitest-environment jsdom
// decorateBrackets walks the rendered highlight.js markup through the DOM, so
// this file needs a document. The rest of the suite stays on the node
// environment, which is much faster.
import { describe, it, expect } from 'vitest';
import { buildBracketMatches, findCaretMatch, highlightCode, decorateBrackets } from './editorHighlight';

/** Convenience: matched pairs as sorted [open, close] tuples. */
function pairs(code: string): [number, number][] {
  const m = buildBracketMatches(code);
  return [...m.entries()].filter(([a, b]) => a < b).sort((x, y) => x[0] - y[0]);
}

describe('buildBracketMatches', () => {
  it('matches a simple pair', () => {
    expect(pairs('()')).toEqual([[0, 1]]);
  });

  it('matches nested pairs', () => {
    //              0123456
    expect(pairs('a(b[c]d)')).toEqual([[1, 7], [3, 5]]);
  });

  it('is bidirectional', () => {
    const m = buildBracketMatches('{}');
    expect(m.get(0)).toBe(1);
    expect(m.get(1)).toBe(0);
  });

  it('ignores brackets inside a double-quoted string', () => {
    expect(pairs('f("(")')).toEqual([[1, 5]]);
  });

  it('ignores brackets inside a single-quoted string', () => {
    expect(pairs("f('(')")).toEqual([[1, 5]]);
  });

  it('ignores brackets inside a template literal', () => {
    expect(pairs('f(`(`)')).toEqual([[1, 5]]);
  });

  it('respects a backslash escape inside a string', () => {
    // The \" does not end the string, so the ( inside stays ignored.
    expect(pairs('f("\\"(")')).toEqual([[1, 7]]);
  });

  it('ignores brackets in a line comment', () => {
    expect(pairs('a() // )))\nb()')).toEqual([[1, 2], [12, 13]]);
  });

  it('ignores brackets in a block comment', () => {
    expect(pairs('a() /* ((( */ b()')).toEqual([[1, 2], [15, 16]]);
  });

  it('leaves an unmatched opener unpaired', () => {
    expect(pairs('(')).toEqual([]);
  });

  it('leaves a mismatched pair unpaired', () => {
    expect(pairs('(]')).toEqual([]);
  });

  it('handles a realistic JSX snippet', () => {
    const code = 'const f = () => { return [1, 2].map((x) => ({ x })); };';
    const m = buildBracketMatches(code);
    // every recorded key maps back to itself
    for (const [a, b] of m) expect(m.get(b)).toBe(a);
    expect(m.size % 2).toBe(0);
  });
});

describe('findCaretMatch', () => {
  const code = 'a(b)c';
  const m = buildBracketMatches(code);

  it('finds the pair when the caret is on the opener', () => {
    expect(findCaretMatch(code, 1, m)).toEqual([1, 3]);
  });

  it('finds the pair when the caret is just after the closer', () => {
    expect(findCaretMatch(code, 4, m)).toEqual([1, 3]);
  });

  it('returns null away from any bracket', () => {
    expect(findCaretMatch(code, 0, m)).toBeNull();
  });
});

describe('highlightCode', () => {
  it('produces highlight.js markup for JavaScript', () => {
    const html = highlightCode('const x = 1;', 'javascript');
    expect(html).toContain('hljs-keyword');
  });

  it('does not throw on invalid input for the language', () => {
    expect(() => highlightCode('<<<>>>', 'javascript')).not.toThrow();
  });
});

describe('decorateBrackets', () => {
  const render = (code: string, caret = -1) =>
    decorateBrackets(highlightCode(code, 'javascript'), code, caret);

  it('wraps brackets in depth classes', () => {
    const out = render('f(g(1))');
    expect(out).toMatch(/class="bd-\d"/);
  });

  it('cycles depth classes over three levels', () => {
    const out = render('a(b(c(d)))');
    expect(out).toContain('bd-0');
    expect(out).toContain('bd-1');
    expect(out).toContain('bd-2');
  });

  it('marks the pair at the caret', () => {
    expect(render('f(1)', 1)).toContain('bd-match');
  });

  it('adds no match class when the caret is away from brackets', () => {
    expect(render('f(1)', 0)).not.toContain('bd-match');
  });

  it('leaves brackets inside a string undecorated', () => {
    // The paren inside the string must not get a depth class, so exactly the
    // two real parens are decorated.
    const out = render('f("(")');
    expect((out.match(/class="bd-\d"/g) ?? []).length).toBe(2);
  });

  it('preserves the code text', () => {
    const code = 'const total = sum([1, 2, 3]);';
    const text = render(code).replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    expect(text).toBe(code);
  });
});
