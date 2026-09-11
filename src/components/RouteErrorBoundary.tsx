import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  /** Reset the boundary when this changes, so navigating away clears the error. */
  resetKey?: string;
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * App-level boundary around the route outlet.
 *
 * Without this, a throw during render unmounts the entire tree and the user
 * gets a blank page with no explanation and no way forward. The two causes
 * seen in practice are a genuine bug in a page component and a ChunkLoadError
 * after a deploy replaces the hashed chunks a stale tab is still holding —
 * "Reload" fixes the second outright, which is why it is the primary action.
 */
export default class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[prephub] route render failed:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    // Navigating to a different route should give the app another chance
    // rather than pinning the user on the error screen.
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isChunkError = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      error.message,
    );

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <AlertTriangle size={44} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">
          {isChunkError ? 'This page needs a refresh' : 'Something went wrong'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          {isChunkError
            ? 'A new version was deployed while this tab was open, so part of the app could not be loaded. Reloading picks up the latest version.'
            : 'This page failed to render. Reloading usually clears it — the details are in the browser console.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            <RotateCcw size={16} /> Reload
          </button>
          <a
            href={import.meta.env.BASE_URL}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Home size={16} /> Home
          </a>
        </div>
        {!isChunkError && (
          <pre className="mt-6 max-w-full overflow-x-auto text-left text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
            {error.message}
          </pre>
        )}
      </div>
    );
  }
}
