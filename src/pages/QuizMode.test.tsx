// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import QuizMode from './QuizMode';
import QuizToolbar from '../features/quiz/QuizToolbar';

const wrap = (node: React.ReactNode) =>
  renderToStaticMarkup(<MemoryRouter initialEntries={['/quiz']}>{node}</MemoryRouter>);

describe('QuizMode after extracting QuizToolbar', () => {
  it('renders without throwing', () => {
    expect(wrap(<QuizMode />)).toBeTruthy();
  });

  it('shows the loading state first — the question bank is fetched', () => {
    // getAllQuestions() is async, and effects do not run in a static render,
    // so the first paint is the loading branch. This is the same path a real
    // cold load takes, and it is where the Review page once went blank.
    const html = wrap(<QuizMode />);
    expect(html).toMatch(/animate-spin|Loading|animate-pulse/i);
  });

  it('has a default export for React.lazy', async () => {
    expect(typeof (await import('./QuizMode')).default).toBe('function');
  });
});

describe('QuizToolbar', () => {
  const props = {
    guideOptions: [{ value: 'all', label: 'All Guides' }, { value: 'React Guide', label: 'React Guide' }],
    selectedGuide: 'all',
    onGuideChange: () => {},
    isShuffled: false,
    onToggleShuffle: () => {},
    onReset: () => {},
    difficulty: 'all',
    onDifficultyChange: () => {},
    currentIndex: 2,
    total: 10,
    score: { knew: 3, learning: 1 },
    progress: 30,
  };

  it('renders every guide option', () => {
    const html = wrap(<QuizToolbar {...props} />);
    expect(html).toContain('All Guides');
    expect(html).toContain('React Guide');
  });

  it('renders all four difficulty chips', () => {
    const html = wrap(<QuizToolbar {...props} />);
    for (const label of ['All', 'beginner', 'intermediate', 'advanced']) {
      expect(html).toContain(label);
    }
  });

  it('shows a 1-based position and both scores', () => {
    const html = wrap(<QuizToolbar {...props} />);
    expect(html).toContain('3 of 10');                    // currentIndex 2 → "3 of 10"
    expect(html).toMatch(/text-emerald-600[\s\S]*?<\/svg> 3</);  // knew, beside the thumbs-up
    expect(html).toMatch(/text-amber-600[\s\S]*?<\/svg> 1</);    // learning, beside the thumbs-down
  });

  it('reflects the progress percentage in the bar width', () => {
    expect(wrap(<QuizToolbar {...props} />)).toContain('width:30%');
  });

  it('marks the active difficulty differently from the others', () => {
    const off = wrap(<QuizToolbar {...props} difficulty="all" />);
    const on = wrap(<QuizToolbar {...props} difficulty="advanced" />);
    expect(off).not.toBe(on);
  });
});
