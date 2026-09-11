// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import CodePlayground from './CodePlayground';
import { allTemplates } from '../../data/playground/playgroundTemplates';

/**
 * Smoke test for the decomposition of CodePlayground: the editor helpers moved
 * to src/lib/, and six filter states plus three persisted preferences moved
 * into useTemplateFilters / useEditorPrefs. Rendering the component proves the
 * hooks are wired and nothing references a binding that moved out.
 */
describe('CodePlayground after decomposition', () => {
  it('renders without throwing', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/playground']}>
        <CodePlayground />
      </MemoryRouter>,
    );
    expect(html).toBeTruthy();
    expect(html).toContain('Code Playground');
  });

  it('shows the Run control and the editor language label', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/playground']}>
        <CodePlayground />
      </MemoryRouter>,
    );
    expect(html).toMatch(/Run/);
    expect(html).toMatch(/Auto-close|Wrap|Format/);
  });

  it('has a default export for React.lazy', async () => {
    const mod = await import('./CodePlayground');
    expect(typeof mod.default).toBe('function');
  });

  it('every template still carries the fields the modal filters on', () => {
    expect(allTemplates.length).toBeGreaterThan(150);
    for (const t of allTemplates) {
      expect(typeof t.name).toBe('string');
      expect(typeof t.code).toBe('string');
      expect(t.code.length).toBeGreaterThan(0);
      if (t.kind === 'challenge' && t.tag === 'JS') {
        // The pattern/difficulty filters only apply to these.
        expect(t.difficulty === undefined || ['Easy', 'Medium', 'Hard'].includes(t.difficulty)).toBe(true);
      }
    }
  });
});
