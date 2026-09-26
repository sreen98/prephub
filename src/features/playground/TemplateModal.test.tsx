import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import TemplateModal from './TemplateModal';
import type { ProgressEntry } from '../../hooks/usePlaygroundProgress';
import { allTemplates } from '../../data/playground/templateIndex';
import { buildTemplateCatalog } from '../../hooks/useTemplateCatalog';

/**
 * The picker used to show a bare total per category — how much there was, and
 * nothing about how far you had got. These pin the "done / total" reading, and
 * that "done" counts SOLVED entries rather than merely-opened ones (the autosave
 * creates an in-progress entry the moment a template loads, so counting entries
 * would have reported everything you had ever clicked as finished).
 */
const solvedNames = ['Tabs', 'Chat App', 'Pagination', 'Search Filter'];

const render = (solved: string[], opened: string[] = []) => {
  const filters = { search: '', tag: 'react', category: 'all', mode: 'challenges',
    pattern: 'all', difficulty: 'all', setTag: () => {}, setCategory: () => {},
    setPattern: () => {}, setDifficulty: () => {}, setSearch: () => {}, setMode: () => {},
    reset: () => {} } as never;
  const catalog = buildTemplateCatalog({ search: '', tag: 'react', category: 'all',
    mode: 'challenges', pattern: 'all', difficulty: 'all' } as never);
  const getEntry = (name: string): ProgressEntry | null =>
    solved.includes(name) ? { code: '', status: 'solved', updatedAt: 't' }
      : opened.includes(name) ? { code: '', status: 'in-progress', updatedAt: 't' }
        : null;
  return renderToStaticMarkup(
    <TemplateModal
      open onClose={() => {}} filters={filters} searchRef={{ current: null }}
      categories={catalog.categories} tagOptions={catalog.tagOptions}
      difficultyCounts={catalog.difficultyCounts} patternCounts={catalog.patternCounts}
      scopeHasPatterns={catalog.scopeHasPatterns} scopeHasDifficulty={catalog.scopeHasDifficulty}
      selectedName={null} getEntry={getEntry}
      onPickTemplate={() => {}} onPickBlank={() => {}} onToast={() => {}} starters={[]}
    />,
  );
};

describe('TemplateModal completion counts', () => {
  // The picker belongs to one playground (tag 'react' here), so the total is
  // that playground's challenges, not both catalogues added together.
  const totalChallenges = allTemplates.filter(t => t.kind === 'challenge' && t.tag === 'React').length;

  it('the header reports solved out of this playground\'s challenge set', () => {
    expect(render(solvedNames)).toContain(`${solvedNames.length} of ${totalChallenges} challenges solved`);
  });

  it('counts only SOLVED, not merely opened', () => {
    // Opening a template autosaves an in-progress entry ~800ms later, so
    // counting entries would report every template you ever clicked as done.
    const html = render([], ['Tabs', 'Chat App', 'Accordion']);
    expect(html).toContain(`0 of ${totalChallenges} challenges solved`);
  });

  it('a category row shows done over its own total', () => {
    const html = render(solvedNames);
    const reactCount = allTemplates.filter(t => t.kind === 'challenge' && t.tag === 'React').length;
    expect(html).toContain(`/${reactCount}`);
  });

  it('zero done is rendered quietly, non-zero is highlighted', () => {
    expect(render([])).not.toContain('text-emerald-600');
    expect(render(solvedNames)).toContain('text-emerald-600');
  });
});
