// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * §13.1's phase demo states an exact console order in a `text` block right below it.
 * Rather than restate that order here (which would drift), pull BOTH the registration
 * lines and the claimed output out of the guide and check one against the other.
 */
describe('JavaScript guide §13.1 — the stated propagation order is real', () => {
  const md = readFileSync('src/content/javascript-and-typescript/javascript-guide.md', 'utf8');
  const demo = md.slice(md.indexOf('function PhaseDemo()'));

  it('registers on outer, inner and the button in the documented order', () => {
    const lines = demo
      .slice(0, demo.indexOf('```'))
      .split('\n')
      .filter(l => l.includes('addEventListener'))
      .map(l => l.trim());
    expect(lines).toHaveLength(5);

    document.body.innerHTML =
      '<div id="outer"><div id="inner"><button id="btn">x</button></div></div>';
    const logged: string[] = [];
    const log = (msg: string) => logged.push(msg);
    const outer = document.getElementById('outer');
    const inner = document.getElementById('inner');
    const btn = document.getElementById('btn');
    const phase = ['', 'CAPTURE', 'TARGET', 'BUBBLE'];
    /* eslint-disable @typescript-eslint/no-implied-eval -- running the guide's own lines is the point */
    const wire = new Function('log', 'outer', 'inner', 'btn', 'phase', lines.join('\n')) as (
      ...a: unknown[]
    ) => void;
    /* eslint-enable @typescript-eslint/no-implied-eval */
    wire(log, outer, inner, btn, phase);
    btn?.click();

    // The claimed output is the `text` block immediately after the demo.
    const claimed = demo
      .slice(demo.indexOf('```text') + 7, demo.indexOf('```', demo.indexOf('```text') + 7))
      .trim()
      .split('\n')
      .map(l => l.split('←')[0].trim());

    expect(logged).toEqual(claimed);
    expect(logged).toEqual([
      'outer CAPTURE',
      'inner CAPTURE',
      'button TARGET',
      'inner BUBBLE',
      'outer BUBBLE',
    ]);
  });

  it('keeps dispatching through ancestors that were detached mid-dispatch', () => {
    document.body.innerHTML = '<div id="p"><button id="c">x</button></div>';
    const logged: string[] = [];
    const parent = document.getElementById('p');
    const child = document.getElementById('c');
    child?.addEventListener('click', () => {
      logged.push('target fired');
      parent?.remove();
    });
    parent?.addEventListener('click', () => logged.push('parent STILL fires'));
    document.addEventListener('click', () => logged.push('document STILL fires'), { once: true });
    child?.click();

    expect(parent?.isConnected).toBe(false);
    expect(logged).toEqual(['target fired', 'parent STILL fires', 'document STILL fires']);
  });

  it('separates target from currentTarget', () => {
    document.body.innerHTML = '<ul id="u"><li><span id="word">w</span></li></ul>';
    const seen: string[] = [];
    document.getElementById('u')?.addEventListener('click', e => {
      seen.push((e.target as HTMLElement).tagName, (e.currentTarget as HTMLElement).tagName);
    });
    document.getElementById('word')?.click();
    expect(seen).toEqual(['SPAN', 'UL']);
  });
});
