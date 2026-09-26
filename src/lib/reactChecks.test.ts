// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { accessibleName, findAll, roleOf, runReactChecks, visibleText } from './reactChecks';

function dom(html: string): HTMLElement {
  document.body.innerHTML = `<div id="root">${html}</div>`;
  return document.getElementById('root')!;
}

describe('reactChecks target matching', () => {
  it('knows implicit roles and accessible names', () => {
    const root = dom('<button aria-label="Close dialog">×</button><label for="e">Email</label><input id="e" placeholder="you@x"><a href="#">Home</a>');
    const [btn, , input, link] = [...root.children];
    expect(roleOf(btn)).toBe('button');
    expect(accessibleName(btn)).toBe('Close dialog');
    expect(roleOf(input)).toBe('textbox');
    expect(accessibleName(input)).toBe('Email');
    expect(roleOf(link)).toBe('link');
  });

  it('skips hidden elements unless asked, and a text match returns the innermost node', () => {
    const root = dom('<section><p>Visible answer</p></section><div hidden><p>Secret answer</p></div>');
    expect(findAll(root, { text: 'answer' }).map((e) => e.textContent)).toEqual(['Visible answer']);
    expect(findAll(root, { text: 'answer', includeHidden: true })).toHaveLength(2);
    expect(visibleText(root)).not.toMatch(/Secret/);
  });
});

describe('runReactChecks', () => {
  it('drives plain DOM behaviour and reports the failing step', async () => {
    const root = dom('');
    const reset = () => {
      root.innerHTML = '<button aria-expanded="false">Toggle</button><p hidden>Details</p>';
      const b = root.querySelector('button')!;
      b.addEventListener('click', () => { const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(open)); root.querySelector('p')!.hidden = !open; });
      return Promise.resolve();
    };
    const results = await runReactChecks(root, [
      { label: 'opens', steps: [{ click: { role: 'button', name: 'Toggle' } }, { expect: { role: 'button' }, attr: 'aria-expanded', equals: 'true' }, { expectText: 'Details' }] },
      { label: 'starts closed (remounted fresh)', steps: [{ expectNoText: 'Details' }] },
      { label: 'wrong on purpose', steps: [{ click: { role: 'button' } }, { expectText: 'Nope' }] },
    ], reset);
    expect(results.map((r) => r.passed)).toEqual([true, true, false]);
    expect(results[2]).toMatchObject({ failedStep: 2, message: 'did not see "Nope"' });
  }, 10000);

  it('Tab from a focused non-tabbable element goes to the next focusable after it, like a browser', async () => {
    const root = dom('');
    const reset = () => { root.innerHTML = '<button>Before</button><div tabindex="-1" id="panel"><input aria-label="Inside"><button>Last</button></div>'; (root.querySelector('#panel') as HTMLElement).focus(); return Promise.resolve(); };
    const [r] = await runReactChecks(root, [{ label: 'tab into panel', steps: [{ press: 'Tab' }, { expect: { label: 'Inside' }, focused: true }] }], reset);
    expect(r.passed).toBe(true);
  });
});
