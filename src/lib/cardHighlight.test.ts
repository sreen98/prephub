import { describe, it, expect } from 'vitest';
import { highlightCode } from './cardHighlight';

describe('cardHighlight', () => {
  it('highlights CSS with the CSS grammar, not the JavaScript fallback', () => {
    const html = highlightCode('.note { color: blue; }', 'css');
    expect(html).toContain('hljs-selector-class');
    expect(html).toContain('hljs-attribute');
  });

  it('still highlights TypeScript', () => {
    expect(highlightCode('const n: number = 1;', 'typescript')).toContain('hljs-keyword');
  });
});
