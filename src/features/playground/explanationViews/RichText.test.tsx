import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RichText, { InlineText } from './RichText';

const html = (text: string) => renderToStaticMarkup(<RichText text={text} />);

// The Explain modals used to print these fields as one plain string, so a
// learner saw literal **asterisks** and every paragraph run together.
describe('RichText', () => {
  it('renders **bold**, *italic* and `code` instead of printing the markers', () => {
    const out = renderToStaticMarkup(<InlineText text="**Sort** it, *then* call `sort()`" />);
    expect(out).toContain('<strong class="font-semibold">Sort</strong>');
    expect(out).toContain('<em>then</em>');
    expect(out).toMatch(/<code[^>]*>sort\(\)<\/code>/);
    expect(out).not.toContain('*');
  });

  it('leaves a lone asterisk in arithmetic alone', () => {
    expect(renderToStaticMarkup(<InlineText text="n * 2 and a*b" />)).toBe('n * 2 and a*b');
  });

  it('splits blank-line paragraphs and turns bullet lines into a list', () => {
    const out = html('First idea.\n\nRules:\n• sum < 0: l++\n• sum > 0: r--\nStop when they meet.');
    expect(out.match(/<p>/g)).toHaveLength(3);
    expect(out).toContain('<ul class="list-disc pl-5 space-y-0.5"><li>sum &lt; 0: l++</li><li>sum &gt; 0: r--</li></ul>');
  });

  it('numbers "1." lines as an ordered list', () => {
    expect(html('1. Validate\n2. Walk')).toContain('<ol class="list-decimal pl-5 space-y-0.5"><li>Validate</li><li>Walk</li></ol>');
  });

  it('joins single newlines inside a paragraph', () => {
    expect(html('one\ntwo')).toContain('<p>one two</p>');
  });
});
