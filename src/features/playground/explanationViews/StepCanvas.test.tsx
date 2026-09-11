// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import StepCanvas from './StepCanvas';
import type { ExplanationStep } from '../../../data/playground/playgroundExplanations';

const base: ExplanationStep = { title: 'A step', detail: 'what happens', pseudoLine: 0 };
const render = (step: ExplanationStep) => renderToStaticMarkup(<StepCanvas step={step} />);
const FALLBACK = /No visual change this step/;

describe('StepCanvas — the fallback is derived, not hand-maintained', () => {
  it('shows the fallback for a narrative-only step', () => {
    expect(render(base)).toMatch(FALLBACK);
  });

  // One case per snapshot kind. The old implementation gated the fallback on a
  // twelve-clause negation that had to be edited whenever a kind was added; if
  // a kind is ever added to the renderer table without wiring, one of these
  // fails rather than the app quietly showing "No visual change" over content.
  it.each([
    ['array',         { array: { cells: [{ value: '1' }] } }],
    ['map',           { map: { entries: [{ key: 'a', value: '1' }] } }],
    ['stack',         { stack: { items: ['a'] } }],
    ['set',           { set: { items: [{ value: 'a' }] } }],
    ['computation',   { computation: { expression: '1 + 1', result: '2' } }],
    ['note',          { note: 'a remark' }],
    ['result',        { result: { found: true, value: '42' } }],
  ])('does NOT show the fallback when a step carries %s', (_kind, extra) => {
    const html = render({ ...base, ...extra } as ExplanationStep);
    expect(html).not.toMatch(FALLBACK);
  });

  it('renders a found result with its value', () => {
    const html = render({ ...base, result: { found: true, value: '42' } });
    expect(html).toContain('42');
    expect(html).toMatch(/Result/);
  });

  it('renders a not-found result distinctly', () => {
    expect(render({ ...base, result: { found: false, value: '' } })).toMatch(/No solution found/);
  });

  it('renders several snapshot kinds together', () => {
    const html = render({
      ...base,
      array: { cells: [{ value: '7' }] },
      note: 'and a note',
    });
    expect(html).toContain('7');
    expect(html).toContain('and a note');
    expect(html).not.toMatch(FALLBACK);
  });
});
