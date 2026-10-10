// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import Sidebar, { type SidebarProps } from './Sidebar';

const props: SidebarProps = {
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  setIsSidebarOpen: () => {},
  setIsSidebarCollapsed: () => {},
  setIsSearchOpen: () => {},
  expandedSections: {},
  toggleSection: () => {},
  dueCount: 0,
  checkpointsCount: 0,
  bookmarksCount: 0,
  hasUnreadChangelog: false,
  theme: 'dark',
  toggleTheme: () => {},
  cycleFontSize: () => {},
  fontSize: 'medium',
  sizeLabel: 'M',
  appVersion: '1.6.0',
};

/** The opening <a> tag of the link to `href` (attribute order is React's business). */
const linkTag = (html: string, href: string) => {
  const at = html.indexOf(`href="${href}"`);
  return at < 0 ? '' : html.slice(html.lastIndexOf('<a', at), html.indexOf('>', at) + 1);
};

const at = (path: string, overrides: Partial<SidebarProps> = {}) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar {...props} {...overrides} />
    </MemoryRouter>,
  );

describe('Sidebar', () => {
  it('renders every tool link', () => {
    const html = at('/');
    for (const label of ['Quiz Mode', 'Daily Review', 'Interview Sim',
                         'JavaScript Playground', 'React Playground', 'Bookmarks', 'Checkpoints']) {
      expect(html).toContain(label);
    }
  });

  it('renders the app version', () => {
    expect(at('/')).toContain('1.6.0');
  });

  /**
   * This is the regression this file exists for. Extracting the sidebar out of
   * App.tsx dropped the `useLocation()` call, and `location` silently resolved
   * to the GLOBAL `window.location` instead — which typechecks fine. The app
   * was then served under a /prephub/ basename, so window.location.pathname was
   * '/prephub/quiz' and never equalled '/quiz', and every active highlight would
   * have been dead in production while looking correct in a dev build. It now
   * lives at the domain root, where the bug would hide until a basename returns.
   */
  it('marks the active tool from the ROUTER location, not window.location', () => {
    const onQuiz = at('/quiz');
    const onReview = at('/review');
    // The active link is marked aria-current="page", and exactly one link is.
    expect(linkTag(onQuiz, '/quiz')).toContain('aria-current="page"');
    expect(linkTag(onQuiz, '/review')).not.toContain('aria-current');
    expect(linkTag(onReview, '/review')).toContain('aria-current="page"');
    expect(onQuiz.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it('renders no active highlight on a route with no matching tool', () => {
    const html = at('/frontend/react');
    expect(linkTag(html, '/quiz')).not.toContain('aria-current');
    expect(linkTag(html, '/quiz')).not.toContain('bg-accent-soft');
  });

  it('shows a due-count badge only when there is something due', () => {
    expect(at('/', { dueCount: 0 })).not.toMatch(/bg-red-100/);
    const withDue = at('/', { dueCount: 7 });
    expect(withDue).toMatch(/bg-red-100/);
    expect(withDue).toContain('7');
  });

  it('shows bookmark and checkpoint badges only when non-zero', () => {
    expect(at('/', { bookmarksCount: 0, checkpointsCount: 0 })).not.toMatch(/rounded-full bg-slate-100/);
    expect(at('/', { bookmarksCount: 4 })).toContain('4');
    expect(at('/', { checkpointsCount: 9 })).toContain('9');
  });

  it('shows the unread dot for a new changelog', () => {
    expect(at('/', { hasUnreadChangelog: false })).not.toMatch(/aria-label="unread"/);
    expect(at('/', { hasUnreadChangelog: true })).toMatch(/aria-label="unread"/);
  });

  /**
   * A group heading used to share the left edge, size and weight of the links
   * under it, so "GLOBAL STATE MANAGEMENT" read as a sibling of "Redux Toolkit"
   * rather than a heading over it. These three cues are what separate them; a
   * refactor that drops the indent or the rule brings the confusion back.
   */
  it('renders group headings as headings, not as items', () => {
    const html = at('/frontend/redux-toolkit', { expandedSections: { 'Front End': true } });

    // The heading exists, and is a <p>, not a link.
    expect(html).toContain('Global State Management');
    expect(html).not.toContain('<a href="/frontend/global-state-management"');

    // Grouped links are indented past the heading's left edge.
    const reduxLink = html.slice(html.indexOf('/frontend/redux-toolkit'));
    expect(reduxLink.slice(0, 400)).toMatch(/pl-5/);

    // And the heading carries its own typographic treatment.
    expect(html).toMatch(/uppercase tracking-\[0\.14em\]/);
  });

  it('translates off-canvas when closed', () => {
    expect(at('/', { isSidebarOpen: false })).toContain('-translate-x-full');
  });
});
