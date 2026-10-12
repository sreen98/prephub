// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { applyLiveCss, LIVE_CSS_DOC, measure, OUTLINE_CSS, parseLiveCss, round } from './liveCss';

describe('parseLiveCss', () => {
  it('splits the first <style> off as the editable CSS and keeps the rest as HTML', () => {
    const src = '<style>\n.box { width: 10px; }\n</style>\n<div class="box">Hi</div>\n';
    expect(parseLiveCss(src)).toEqual({ css: '.box { width: 10px; }', html: '<div class="box">Hi</div>' });
  });

  it('normalises CRLF, so a Windows checkout parses the same', () => {
    expect(parseLiveCss('<style>\r\na { }\r\n</style>\r\n<a>x</a>')).toEqual({ css: 'a { }', html: '<a>x</a>' });
  });

  it('a block with no <style> is all HTML', () => {
    expect(parseLiveCss('<p>Only markup</p>')).toEqual({ css: '', html: '<p>Only markup</p>' });
  });
});

describe('round', () => {
  it('keeps one decimal place', () => {
    expect([round(444), round(33.3333), round(52.44)]).toEqual([444, 33.3, 52.4]);
  });
});

function previewDoc(): Document {
  return new DOMParser().parseFromString(LIVE_CSS_DOC, 'text/html');
}

describe('applyLiveCss and measure', () => {
  it('writes the CSS, the outline sheet and the HTML into the preview', () => {
    const doc = previewDoc();
    applyLiveCss(doc, { css: 'p { color: red; }', html: '<p>Hi</p>' }, true);
    expect(doc.getElementById('live-user')?.textContent).toBe('p { color: red; }');
    expect(doc.getElementById('live-outline')?.textContent).toBe(OUTLINE_CSS);
    expect(doc.body.innerHTML).toBe('<p>Hi</p>');
    applyLiveCss(doc, { css: '', html: '<p>Hi</p>' }, false);
    expect(doc.getElementById('live-outline')?.textContent).toBe('');
  });

  it('reports only [data-measure] elements, with their requested computed props', () => {
    // jsdom has no layout, so sizes are 0 here; the browser check is in CLAUDE.md.
    const doc = previewDoc();
    // DOMParser documents have no window, so measure through the test's own document.
    document.head.innerHTML = '<style>.a { color: rgb(255, 0, 0); }</style>';
    document.body.innerHTML = '<p class="a" data-measure="para" data-props="color">x</p><p>skip</p><b data-measure>y</b>';
    const items = measure(document);
    expect(items.map((m) => m.label)).toEqual(['para', 'b']);
    expect(items[0].props).toEqual([{ name: 'color', value: 'rgb(255, 0, 0)' }]);
    expect(items[0].box).toBeUndefined();
    expect(measure(doc)).toEqual([]);
  });

  it('adds a box model for [data-box], from the computed sides', () => {
    document.head.innerHTML = '<style>.b { margin: 4px 3px; padding: 10px; border: 2px solid; }</style>';
    document.body.innerHTML = '<div class="b" data-measure="b" data-box></div>';
    const [item] = measure(document);
    expect(item.box?.margin).toEqual({ top: 4, right: 3, bottom: 4, left: 3 });
    expect(item.box?.padding).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
    expect(item.box?.border).toEqual({ top: 2, right: 2, bottom: 2, left: 2 });
  });
});
