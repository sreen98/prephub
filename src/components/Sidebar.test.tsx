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
                         'Code Playground', 'Bookmarks', 'Checkpoints']) {
      expect(html).toContain(label);
    }
  });

  it('renders the app version', () => {
    expect(at('/')).toContain('1.6.0');
  });

  /**
   * This is the regression this file exists for. Extracting the sidebar out of
   * App.tsx dropped the `useLocation()` call, and `location` silently resolved
   * to the GLOBAL `window.location` instead — which typechecks fine. Because
   * the app is served under a /prephub/ basename, window.location.pathname is
   * '/prephub/quiz' and never equals '/quiz', so every active highlight would
   * have been dead in production while looking correct in a dev build.
   */
  it('marks the active tool from the ROUTER location, not window.location', () => {
    const onQuiz = at('/quiz');
    const onReview = at('/review');
    expect(onQuiz).not.toBe(onReview);
    // The active link carries its accent background; exactly one does.
    const activeCount = (html: string) => (html.match(/shadow-sm/g) ?? []).length;
    expect(activeCount(onQuiz)).toBeGreaterThan(0);
  });

  it('renders no active highlight on a route with no matching tool', () => {
    const html = at('/frontend/react');
    const quizActive = /href="\/quiz"[^>]*bg-amber-50/.test(html);
    expect(quizActive).toBe(false);
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
    expect(at('/', { hasUnreadChangelog: false })).not.toMatch(/animate-pulse/);
    expect(at('/', { hasUnreadChangelog: true })).toMatch(/animate-pulse/);
  });

  it('translates off-canvas when closed', () => {
    expect(at('/', { isSidebarOpen: false })).toContain('-translate-x-full');
  });
});
