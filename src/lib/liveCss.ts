// The model behind a ```css-live block in a guide: an editable stylesheet applied to a
// fixed piece of HTML in a sandboxed iframe, with the elements the guide asks about
// measured after every edit.
//
// A block is written as plain HTML so it still reads well where it isn't rendered live
// (Quiz, Review): the first <style> element is the editable CSS, and the rest is the
// markup. Elements marked `data-measure="label"` are measured; `data-props="font-size
// color"` adds computed values to that element's readout; `data-box` adds a box-model
// diagram.

export interface LiveCssSource { css: string; html: string }

export function parseLiveCss(source: string): LiveCssSource {
  const text = source.replace(/\r\n/g, '\n');
  const match = /<style>\n?([\s\S]*?)<\/style>\n?/.exec(text);
  if (!match) return { css: '', html: text.trim() };
  return {
    css: match[1].replace(/\s+$/, ''),
    html: (text.slice(0, match.index) + text.slice(match.index + match[0].length)).trim(),
  };
}

/**
 * The preview document. The page keeps the browser's default styles (the 8px body
 * margin included), because the guide's answers were measured against them. Only the
 * font and colours are set, so the preview reads the same in both site themes, and the
 * scrollbar space is always reserved, so a scrollbar appearing never changes a width.
 */
export const LIVE_CSS_DOC = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>html { color-scheme: light; scrollbar-gutter: stable; } body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1e293b; background: #fff; }</style>
<style id="live-outline"></style><style id="live-user"></style></head><body></body></html>`;

/** Dashed outlines on every element, to see the boxes without changing their size. */
export const OUTLINE_CSS = 'body * { outline: 1px dashed rgb(99 102 241 / 0.7); outline-offset: -1px; }';

export interface Sides { top: number; right: number; bottom: number; left: number }

export interface BoxModel { margin: Sides; border: Sides; padding: Sides; contentWidth: number; contentHeight: number }

export interface Measurement {
  label: string;
  width: number;
  height: number;
  x: number;
  y: number;
  props: { name: string; value: string }[];
  box?: BoxModel;
}

/** Rounds to one decimal place, so 33.3333 shows as 33.3 and 444 stays 444. */
export const round = (n: number): number => Math.round(n * 10) / 10;

function sides(style: CSSStyleDeclaration, prefix: string, suffix = ''): Sides {
  const read = (side: string) => round(parseFloat(style.getPropertyValue(`${prefix}-${side}${suffix}`)) || 0);
  return { top: read('top'), right: read('right'), bottom: read('bottom'), left: read('left') };
}

/** Measures every `[data-measure]` element in the preview, in document order. */
export function measure(doc: Document): Measurement[] {
  const win = doc.defaultView;
  if (!win) return [];
  return [...doc.querySelectorAll<HTMLElement>('[data-measure]')].map((el) => {
    const rect = el.getBoundingClientRect();
    const style = win.getComputedStyle(el);
    const props = (el.dataset.props ?? '').split(/\s+/).filter(Boolean)
      .map((name) => ({ name, value: style.getPropertyValue(name) }));
    const result: Measurement = {
      label: el.dataset.measure || el.tagName.toLowerCase(),
      width: round(rect.width),
      height: round(rect.height),
      x: round(rect.left + win.scrollX),
      y: round(rect.top + win.scrollY),
      props,
    };
    if (el.dataset.box !== undefined) {
      const margin = sides(style, 'margin');
      const border = sides(style, 'border', '-width');
      const padding = sides(style, 'padding');
      result.box = {
        margin, border, padding,
        contentWidth: round(rect.width - border.left - border.right - padding.left - padding.right),
        contentHeight: round(rect.height - border.top - border.bottom - padding.top - padding.bottom),
      };
    }
    return result;
  });
}

/** The HTML last written to each preview, so a CSS-only edit doesn't rebuild the page. */
const appliedHtml = new WeakMap<Document, string>();

/** Writes the CSS and HTML into the preview document and measures the result. */
export function applyLiveCss(doc: Document, { css, html }: LiveCssSource, outlines: boolean): Measurement[] {
  const user = doc.getElementById('live-user');
  const outline = doc.getElementById('live-outline');
  if (user) user.textContent = css;
  if (outline) outline.textContent = outlines ? OUTLINE_CSS : '';
  if (appliedHtml.get(doc) !== html) {
    doc.body.innerHTML = html;
    appliedHtml.set(doc, html);
  }
  return measure(doc);
}
