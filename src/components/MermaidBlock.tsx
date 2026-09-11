import React, { useEffect, useRef, useState } from 'react';

// Mermaid ships its own types, so use them rather than a hand-rolled shape —
// a local `{ initialize, render }` guess drifts from the real API and hides
// signature changes across versions.
type MermaidApi = Awaited<typeof import('mermaid')>['default'];

let mermaidModule: MermaidApi | null = null;
let mermaidReady: boolean = false;

async function getMermaid(): Promise<MermaidApi> {
  const mermaid = mermaidModule ?? (await import('mermaid')).default;
  mermaidModule = mermaid;
  if (!mermaidReady) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: { htmlLabels: true, curve: 'basis' },
      suppressErrorRendering: true,
    });
    mermaidReady = true;
  }
  return mermaid;
}

let counter: number = 0;

interface MermaidBlockProps {
  chart: string;
}

export default function MermaidBlock({ chart }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${++counter}`;

    getMermaid()
      .then(mermaid => mermaid.render(id, chart.trim(), containerRef.current ?? undefined))
      .then(({ svg: renderedSvg }: { svg: string }) => {
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setSvg('');
        }
      })
      .finally(() => {
        // Clean up any error elements Mermaid may have injected into the DOM
        document.querySelectorAll(`#d${id}, [id="${id}"]`).forEach(el => el.remove());
        document.querySelectorAll('body > [id^="dmermaid-"], body > [id^="mermaid-"]').forEach(el => el.remove());
      });

    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="code-block my-6">
        <div className="code-block-header">
          <span className="code-lang">diagram</span>
        </div>
        <pre className="code-block-body"><code>{chart}</code></pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-container">
        <div ref={containerRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} />
        <div className="text-slate-500 dark:text-slate-400 text-sm">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
