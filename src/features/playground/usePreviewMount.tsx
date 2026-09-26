import React, { useCallback, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import PreviewErrorBoundary from './PreviewErrorBoundary';

// Mounting the reader's React element into the preview pane. Moved out of
// CodePlayground (held at a line ceiling) when behaviour checks needed to
// REMOUNT the same element fresh before each check, so one check's clicks
// never leak into the next.
//
// Both error paths from CLAUDE.md rule 11 stay here: `onUncaughtError` on the
// root and `PreviewErrorBoundary` around the element. (The window error and
// unhandledrejection listeners stay in CodePlayground.)

export interface PreviewRoot { render: (n: React.ReactNode) => void; unmount: () => void }

export function usePreviewMount(
  previewRef: React.RefObject<HTMLDivElement | null>,
  reactRootRef: React.RefObject<PreviewRoot | null>,
) {
  const lastElement = useRef<React.ReactElement | null>(null);
  const lastReport = useRef<(message: string) => void>(() => {});
  const generation = useRef(0);
  // The whole program, re-runnable, so a remount also resets module-level state
  // (a store or a Map declared at the top of the snippet), not just React state.
  const program = useRef<(() => void) | null>(null);

  const mount = useCallback((element: React.ReactElement, reportError: (message: string) => void): boolean => {
    if (!previewRef.current) return false;
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
    }
    reactRootRef.current = ReactDOM.createRoot(previewRef.current, {
      // React 19 routes errors it recovered from, and ones nothing caught,
      // through this, including ones an error boundary already handled, which
      // is how we log *and* show a fallback.
      onUncaughtError: (err: unknown) => {
        reportError(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
      },
    });
    generation.current += 1;
    reactRootRef.current.render(
      <PreviewErrorBoundary key={generation.current} onError={reportError}>{element}</PreviewErrorBoundary>,
    );
    return true;
  }, [previewRef, reactRootRef]);

  /** The `render()` a snippet calls. `onMounted` fires once the element is in the pane. */
  const makeRenderFn = useCallback((reportError: (message: string) => void, onMounted: () => void) =>
    (element: React.ReactElement) => {
      lastElement.current = element;
      lastReport.current = reportError;
      if (mount(element, reportError)) onMounted();
    }, [mount]);

  const setProgram = useCallback((run: (() => void) | null) => { program.current = run; }, []);

  /** Run the program again (or re-mount the last element), with fresh state. Resolves after it commits. */
  const remount = useCallback(async (): Promise<void> => {
    if (program.current) program.current();
    else if (lastElement.current) mount(lastElement.current, lastReport.current);
    await new Promise((r) => setTimeout(r, 60));
  }, [mount]);

  const hasElement = useCallback(() => lastElement.current !== null && !!previewRef.current?.firstChild, [previewRef]);

  return { makeRenderFn, remount, hasElement, setProgram };
}
