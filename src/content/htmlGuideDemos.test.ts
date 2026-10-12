// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Every output the HTML guide claims, run as a whole page in a jsdom iframe. jsdom parses with
 * parse5, an implementation of the HTML standard's parsing algorithm, so the parser
 * repairs in Tricky Q1–Q3 are the real ones, not a hand-written guess.
 */
const guide = readFileSync('src/content/front-end/html-guide.md', 'utf8').replace(/\r\n/g, '\n');

/** The ```html block containing `marker`. */
function block(marker: string): string {
  const i = guide.indexOf(marker);
  expect(i, `marker not found: ${marker}`).toBeGreaterThan(-1);
  expect(guide.indexOf(marker, i + 1), `marker is not unique: ${marker}`).toBe(-1);
  const start = guide.lastIndexOf('```html\n', i) + 8;
  return guide.slice(start, guide.indexOf('```', start));
}

/** Loads the block as a page in a fresh iframe, with scripts running, and returns what it logged. */
function run(html: string): string[] {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const win = frame.contentWindow as unknown as Window & typeof globalThis;
  const logs: string[] = [];
  const errors: unknown[] = [];
  win.console = { ...console, log: (...a: unknown[]) => logs.push(a.map(String).join(' ')) };
  win.addEventListener('error', (e) => errors.push(e.error ?? e.message));
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(`<!DOCTYPE html>${html}`);
  doc.close();
  frame.remove();
  expect(errors, 'a script in the block threw').toEqual([]);
  // A page that printed nothing would make every assertion below vacuous.
  expect(logs.length, 'the block printed nothing').toBeGreaterThan(0);
  return logs;
}

describe('HTML guide — reference sections', () => {
  it('§7 — the Constraint Validation API, and clearing a custom message', () => {
    expect(run(block('age.validity.rangeUnderflow'))).toEqual(['false', 'true', 'You must be 18 or over']);
  });

  it('§8 — value property vs value attribute', () => {
    expect(run(block("input.value = 'Grace';"))).toEqual(['Grace', 'Ada', 'Ada']);
  });

  it('§13 — cloning a template', () => {
    expect(run(block("for (const title of ['Write tests', 'Ship'])"))).toEqual(['2']);
  });

  it('§13 — a custom element renders into a private shadow root', () => {
    expect(run(block('class UserBadge extends HTMLElement'))).toEqual(['Ada', 'null']);
  });

  it('§15 — textContent creates no elements', () => {
    expect(run(block('out.textContent = comment;'))).toEqual(['0']);
  });
});

describe('HTML guide — tricky questions', () => {
  it('Q1 — a div inside a p closes the p, and the stray </p> makes an empty one', () => {
    expect(run(block('<p>Intro<div>Box</div></p>'))).toEqual(['2', '<p>Intro</p>']);
  });

  it('Q2 — <div /> is an open tag', () => {
    expect(run(block('<span>Title</span>'))).toEqual(['2']);
  });

  it('Q3 — foster parenting and the implied tbody', () => {
    expect(run(block('<div>Loose text</div>'))).toEqual(['DIV', 'TBODY', '0']);
  });

  it('Q4 — the dirty value flag', () => {
    expect(run(block("who.setAttribute('value', 'Linus');"))).toEqual(['Grace', 'Linus', 'Linus']);
  });

  it('Q5 — boolean attributes ignore their value', () => {
    expect(run(block('<button id="pay" disabled="false">'))).toEqual(['true', 'true', 'false']);
  });

  it('Q6 — a button with no type submits its form', () => {
    expect(run(block("console.log('submitted by'"))).toEqual(['submitted by toggle']);
  });

  it('Q7 — only successful controls are submitted', () => {
    expect(run(block('<input name="role" value="admin" disabled>'))).toEqual(['user=ada&ref=R-42&terms=on']);
  });

  it('Q8 — template content is an inert fragment', () => {
    expect(run(block('<li>One</li><li>Two</li><li>Three</li>'))).toEqual(['0', '3', '0']);
  });

  it('Q9 — duplicate ids resolve to the first element', () => {
    expect(run(block('<input id="email" name="personal">'))).toEqual(['work', '2', 'work']);
  });
});
