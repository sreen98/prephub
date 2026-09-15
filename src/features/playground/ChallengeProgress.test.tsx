import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { SolvedChip, CompleteToggle } from './ChallengeProgress';
import type { Progress } from '../../hooks/usePlaygroundProgress';

/**
 * The picker renders a "done / total" count beside EVERY category, including the
 * 51 reference templates (JS Polyfills alone is 32 of them). But the complete
 * toggle used to render only for `kind === 'challenge'`, so those counts were
 * structurally stuck at 0/32 forever — the UI promised progress it had no way
 * to record. These pin the fix in both directions.
 */
const progress = (solved: string[]): Progress =>
  Object.fromEntries(solved.map(n => [n, { code: '', status: 'solved' as const, updatedAt: 't' }]));

const challenge = { kind: 'challenge', tag: 'JS' };
const reactChallenge = { kind: 'challenge', tag: 'React' };
const reference = { kind: 'reference', tag: 'JS' };

describe('CompleteToggle', () => {
  it('renders for a reference template — the bug being fixed', () => {
    const html = renderToStaticMarkup(
      <CompleteToggle name="Array.map" template={reference} progress={progress([])} onChange={() => {}} />,
    );
    expect(html).not.toBe('');
    expect(html).toContain('Mark read');
    expect(html).toContain('aria-pressed="false"');
  });

  it('still renders for challenges, with their own wording', () => {
    const js = renderToStaticMarkup(
      <CompleteToggle name="Two Sum" template={challenge} progress={progress([])} onChange={() => {}} />);
    expect(js).toContain('Mark complete');
    expect(js).toContain('automatically when every test passes');   // JS challenges self-complete
    const react = renderToStaticMarkup(
      <CompleteToggle name="Tabs" template={reactChallenge} progress={progress([])} onChange={() => {}} />);
    expect(react).toContain('Mark complete');
    expect(react).not.toContain('automatically when every test passes');
  });

  it('reflects the solved state for a reference template', () => {
    const html = renderToStaticMarkup(
      <CompleteToggle name="Array.map" template={reference} progress={progress(['Array.map'])} onChange={() => {}} />);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Completed');
  });

  it('renders nothing with no template open', () => {
    expect(renderToStaticMarkup(
      <CompleteToggle name={null} template={reference} progress={progress([])} onChange={() => {}} />)).toBe('');
    expect(renderToStaticMarkup(
      <CompleteToggle name="x" template={null} progress={progress([])} onChange={() => {}} />)).toBe('');
  });
});

describe('SolvedChip counts the set you are looking at', () => {
  const challengeNames = ['Two Sum', 'Tabs', 'Pagination'];
  const referenceNames = ['Array.map', 'Array.filter'];

  it('counts challenges while a challenge is open', () => {
    const html = renderToStaticMarkup(
      <SolvedChip challengeNames={challengeNames} referenceNames={referenceNames}
        progress={progress(['Two Sum'])} current={challenge} />);
    expect(html).toContain('1 / 3 solved');
  });

  it('counts reference templates while one of those is open', () => {
    const html = renderToStaticMarkup(
      <SolvedChip challengeNames={challengeNames} referenceNames={referenceNames}
        progress={progress(['Array.map'])} current={reference} />);
    expect(html).toContain('1 / 2 read');
  });

  it('falls back to challenges when nothing is open', () => {
    const html = renderToStaticMarkup(
      <SolvedChip challengeNames={challengeNames} referenceNames={referenceNames}
        progress={progress([])} current={null} />);
    expect(html).toContain('0 / 3 solved');
  });

  it('never counts progress entries outside its own denominator', () => {
    // The autosave writes an entry for anything merely opened, so counting the
    // raw map would let the chip read higher than its total.
    const html = renderToStaticMarkup(
      <SolvedChip challengeNames={challengeNames} referenceNames={referenceNames}
        progress={progress(['Two Sum', 'Array.map', 'Something Deleted'])} current={challenge} />);
    expect(html).toContain('1 / 3 solved');
  });
});
