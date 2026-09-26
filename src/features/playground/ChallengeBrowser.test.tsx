import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ChallengeBrowser from './ChallengeBrowser';
import ChallengeProblemPanel from './ChallengeProblemPanel';
import TemplateModal from './TemplateModal';
import { challengeTracks } from '../../data/playground/challengeTracks';
import { buildTemplateCatalog } from '../../hooks/useTemplateCatalog';
import type { ProgressEntry } from '../../hooks/usePlaygroundProgress';

const noop = () => {};
const solved = (names: string[]) => (name: string): ProgressEntry | null =>
  names.includes(name) ? { code: '', status: 'solved', updatedAt: 't' } : null;

describe('ChallengeBrowser — challenges grouped into study tracks', () => {
  const twoPointer = challengeTracks.find((t) => t.title === 'Two Pointer')!;

  it('lists the JS tracks with done/total, and opens on the track it is given', () => {
    const html = renderToStaticMarkup(
      <ChallengeBrowser open onClose={noop} selectedName={twoPointer.names[0]} getEntry={solved([twoPointer.names[0]])}
        onPick={noop} onToast={noop} initialTrackId={twoPointer.id} />,
    );
    const esc = (x: string) => x.replace(/&/g, '&amp;');
    for (const t of challengeTracks.filter((x) => x.tag === 'JS')) expect(html).toContain(esc(t.title));
    expect(html).toContain(`1/${twoPointer.names.length}`);
    expect(html).toContain(esc(twoPointer.idea));
    expect(html).toContain('Continue');           // one solved, so not "Start track"
  });

  it('a React challenge opens on the React tab, showing the theme tracks', () => {
    const html = renderToStaticMarkup(
      <ChallengeBrowser open onClose={noop} selectedName="Accordion" getEntry={solved([])} onPick={noop} onToast={noop} />,
    );
    expect(html).toContain('Overlays &amp; Disclosure');
    expect(html).not.toContain('Sliding Window');
  });

  it('renders nothing when closed', () => {
    expect(renderToStaticMarkup(
      <ChallengeBrowser open={false} onClose={noop} selectedName={null} getEntry={solved([])} onPick={noop} onToast={noop} />,
    )).toBe('');
  });
});

describe('ChallengeProblemPanel — track navigation', () => {
  const track = challengeTracks.find((t) => t.names.length >= 3)!;
  const at = (index: number) => ({
    track, index,
    prev: index > 0 ? track.names[index - 1] : null,
    next: index < track.names.length - 1 ? track.names[index + 1] : null,
  });

  // The statement and the editor share the column; the reader sets the split.
  it('has a keyboard-reachable resize handle with a sized content area', () => {
    const html = renderToStaticMarkup(<ChallengeProblemPanel name={track.names[0]} isReact={false} active={null} onGo={noop} />);
    expect(html).toMatch(/role="separator"[^>]*aria-orientation="horizontal"/);
    expect(html).toContain('tabindex="0"');
    expect(html).toMatch(/style="height:\d+px"/);
  });

  it('shows the position in the track, and disables Prev on the first challenge', () => {
    const html = renderToStaticMarkup(<ChallengeProblemPanel name={track.names[0]} isReact={track.tag === 'React'} active={at(0)} onGo={noop} />);
    expect(html).toContain(`1 of ${track.names.length}`);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>.*Prev/);
  });

  it('hides the navigation when the challenge was not opened from a track', () => {
    const html = renderToStaticMarkup(<ChallengeProblemPanel name={track.names[0]} isReact={false} active={null} onGo={noop} />);
    expect(html).not.toContain('Prev');
  });
});

describe('TemplateModal — templates only', () => {
  it('no longer offers a Challenges tab (challenges have their own browser)', () => {
    const catalog = buildTemplateCatalog({ search: '', tag: 'all', category: 'all', mode: 'templates', pattern: 'all', difficulty: 'all' } as never);
    const filters = { search: '', tag: 'all', category: 'all', mode: 'templates', pattern: 'all', difficulty: 'all',
      setTag: noop, setCategory: noop, setPattern: noop, setDifficulty: noop, setSearch: noop, setMode: noop, reset: noop } as never;
    const html = renderToStaticMarkup(
      <TemplateModal open onClose={noop} filters={filters} searchRef={{ current: null }}
        categories={catalog.categories} tagOptions={catalog.tagOptions} difficultyCounts={catalog.difficultyCounts}
        patternCounts={catalog.patternCounts} scopeHasPatterns={catalog.scopeHasPatterns} scopeHasDifficulty={catalog.scopeHasDifficulty}
        selectedName={null} getEntry={() => null} onPickTemplate={noop} onPickBlank={noop} onToast={noop} starters={[]} />,
    );
    expect(html).toContain('Blank');
    expect(html).not.toMatch(/>Challenges<span/);
  });
});
