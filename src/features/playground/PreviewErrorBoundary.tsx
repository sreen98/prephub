import React from 'react';

interface Props {
  /** Reports the failure to the playground's console panel. */
  onError: (message: string) => void;
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Wraps whatever the user's `render()` call mounts.
 *
 * Without it, a throw anywhere in the previewed component — during render, in
 * a lifecycle method, or in an effect — makes React unmount the entire preview
 * tree, so the pane simply goes white. Nothing appears in the console panel
 * either, because the error never passes through `console.error`. The user is
 * left with "why is there no output?" and no way to find out.
 *
 * A very common way to hit this: pasting a snippet from a guide that calls a
 * helper the snippet does not define (`fetchResults`, `api.get`, …). It mounts
 * fine, then throws the moment an effect fires.
 */
export default class PreviewErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const where = info.componentStack?.trim().split('\n')[0]?.trim();
    this.props.onError(
      `${error.name}: ${error.message}${where ? `\n    in ${where.replace(/^at\s+/, '')}` : ''}`,
    );
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={{
        padding: 16, fontFamily: 'ui-monospace, monospace', fontSize: 13,
        color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: 6, margin: 12, whiteSpace: 'pre-wrap',
      }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>
          Your component threw while rendering
        </strong>
        {error.name}: {error.message}
        <div style={{ marginTop: 10, color: '#7f1d1d', fontSize: 12 }}>
          The full message is in Console Output. If this names something like
          {' '}<code>fetchResults</code> or <code>api</code>, the snippet is calling a
          helper it does not define — add a stub for it.
        </div>
      </div>
    );
  }
}
