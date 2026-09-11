// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import PreviewErrorBoundary from './PreviewErrorBoundary';

/**
 * The case this guards is a user pasting a snippet that calls a helper it does
 * not define — `fetchResults`, `api.get`, and so on. It mounts fine, then
 * throws the moment an effect fires. Before the boundary existed, React
 * unmounted the whole preview and the pane simply went white with nothing in
 * the console panel: "why is there no output?" with no way to find out.
 */
function Boom(): React.ReactNode {
  // exactly the shape of the reported snippet
  return (undefined as unknown as { fetchResults: () => React.ReactNode }).fetchResults();
}

describe('PreviewErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    const html = renderToStaticMarkup(
      <PreviewErrorBoundary onError={() => {}}>
        <p>all good</p>
      </PreviewErrorBoundary>,
    );
    expect(html).toContain('all good');
  });

  it('shows a readable fallback instead of a blank pane', () => {
    // renderToStaticMarkup does not run error boundaries, so the fallback is
    // rendered from the component's error state directly.
    const boundary = new PreviewErrorBoundary({ onError: () => {}, children: null });
    boundary.state = { error: new TypeError('fetchResults is not a function') };
    const fallback = renderToStaticMarkup(boundary.render() as React.ReactElement);
    expect(fallback).toContain('threw while rendering');
    expect(fallback).toContain('fetchResults is not a function');
    expect(fallback).toContain('Console Output');
  });

  it('a throwing child does escape when no boundary is present', () => {
    // Proves the failure mode the boundary exists for: unguarded, the throw
    // propagates and would tear down the preview root.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderToStaticMarkup(<Boom />)).toThrow();
    spy.mockRestore();
  });

  it('derives its error state from a thrown error', () => {
    const err = new ReferenceError('fetchResults is not defined');
    expect(PreviewErrorBoundary.getDerivedStateFromError(err)).toEqual({ error: err });
  });

  it('reports the failure to the console panel', () => {
    const reported: string[] = [];
    const boundary = new PreviewErrorBoundary({ onError: (m) => reported.push(m), children: null });
    boundary.componentDidCatch(
      new ReferenceError('fetchResults is not defined'),
      { componentStack: '\n    at Search (playground.tsx:12:3)' },
    );
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain('ReferenceError: fetchResults is not defined');
    expect(reported[0]).toContain('Search');
  });

  it('handles a missing component stack', () => {
    const reported: string[] = [];
    const boundary = new PreviewErrorBoundary({ onError: (m) => reported.push(m), children: null });
    boundary.componentDidCatch(new Error('plain'), {});
    expect(reported[0]).toBe('Error: plain');
  });
});
