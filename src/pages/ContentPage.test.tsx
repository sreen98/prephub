import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import ContentPage from './ContentPage';

/**
 * Smoke test for the extraction of ContentPage out of App.tsx. A 200 on the
 * route only proves the SPA shell was served — the shell is identical for every
 * route. This actually renders the component, so a broken import, a missing
 * helper (stripMarkdownToc, cn, safeSet all moved with it) or a hook called
 * outside its provider fails here instead of as a blank page in the browser.
 */
describe('ContentPage renders after being extracted from App.tsx', () => {
  it('renders the loading skeleton without throwing', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/frontend/react']}>
        <ContentPage
          filePath="./content/front-end/react-guide.md"
          guidePath="/frontend/react"
          guideName="React Guide"
        />
      </MemoryRouter>,
    );
    expect(html).toBeTruthy();
    // Content is fetched in an effect, which renderToStaticMarkup never runs,
    // so the first paint is the skeleton — same as a real cold load.
    expect(html).toMatch(/animate-pulse|aria-busy/);
  });

  it('renders for a cheat sheet path too (no guidePath/guideName)', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/cheatsheets/regex']}>
        <ContentPage filePath="./content/cheatsheets/regex.md" />
      </MemoryRouter>,
    );
    expect(html).toBeTruthy();
  });

  it('exposes a default export, which is what React.lazy requires', async () => {
    const mod = await import('./ContentPage');
    expect(typeof mod.default).toBe('function');
  });
});
