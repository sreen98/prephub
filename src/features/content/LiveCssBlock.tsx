import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, SquareDashed } from 'lucide-react';
import { cn } from '../../lib/cn';
import { applyLiveCss, LIVE_CSS_DOC, parseLiveCss, type Measurement } from '../../lib/liveCss';
import BoxModelDiagram from './BoxModelDiagram';

// A ```css-live block: the guide's CSS in an editable box, applied to the guide's HTML
// in a sandboxed iframe as you type. The elements the question is about are measured
// after every change, and a value that differs from the original shows what it was,
// so the effect of an edit is visible as a number, not only as pixels.
//
// The iframe gets `allow-same-origin` and nothing else: scripts and inline handlers
// can't run, and this component can still reach into the document to update the
// stylesheet and measure (rebuilding `srcdoc` on every keystroke would flash).

type Tab = 'css' | 'html';

const MIN_HEIGHT = 60;
const MAX_HEIGHT = 560;

function Value({ now, was, unit = 'px' }: { now: number | string; was?: number | string; unit?: string }) {
  const changed = was !== undefined && was !== now;
  return (
    <span className={cn(changed && 'rounded bg-pop-soft px-1 font-semibold text-ink')}>
      {now}{unit}
      {changed && <span className="font-normal text-muted"> (was {was}{unit})</span>}
    </span>
  );
}

function Readout({ items, baseline }: { items: Measurement[]; baseline: Map<string, Measurement> }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3 border-t border-line px-4 py-3 text-sm" aria-live="polite">
      {items.map((m, i) => {
        const was = baseline.get(m.label);
        return (
          <div key={`${m.label}-${i}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <code className="font-semibold text-accent-strong">{m.label}</code>
              <span><Value now={m.width} was={was?.width} unit="" /> × <Value now={m.height} was={was?.height} /></span>
              <span className="text-muted">at x <Value now={m.x} was={was?.x} unit="" />, y <Value now={m.y} was={was?.y} unit="" /></span>
              {m.props.map((p) => (
                <span key={p.name}>
                  <span className="text-muted">{p.name}:</span>{' '}
                  <Value now={p.value} was={was?.props.find((q) => q.name === p.name)?.value} unit="" />
                </span>
              ))}
            </div>
            {m.box && <BoxModelDiagram box={m.box} />}
          </div>
        );
      })}
    </div>
  );
}

export default function LiveCssBlock({ source }: { source: string }) {
  const original = useMemo(() => parseLiveCss(source), [source]);
  const [css, setCss] = useState(original.css);
  const [html, setHtml] = useState(original.html);
  const [tab, setTab] = useState<Tab>('css');
  const [outlines, setOutlines] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [items, setItems] = useState<Measurement[]>([]);
  const [baseline, setBaseline] = useState<Map<string, Measurement>>(new Map());
  const frameRef = useRef<HTMLIFrameElement>(null);
  // The ResizeObserver callback outlives renders, so it reads the current state from here.
  const latest = useRef({ css, html, outlines });
  useEffect(() => { latest.current = { css, html, outlines }; }, [css, html, outlines]);

  /** Applies the current (or given) state to the preview, then measures it. */
  const refresh = useCallback((next?: Partial<typeof latest.current>) => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    const state = { ...latest.current, ...next };
    // The "was" values come from the original code measured now, at the current width, so
    // a width change (the slider, a scrollbar appearing) is never reported as an edit.
    const edited = state.css !== original.css || state.html !== original.html;
    const before = edited ? applyLiveCss(doc, original, state.outlines) : [];
    const measured = applyLiveCss(doc, { css: state.css, html: state.html }, state.outlines);
    setBaseline(new Map(before.map((m) => [m.label, m])));
    setItems(measured);
    // The root's own box, not scrollHeight, which never drops below the iframe's height.
    const contentHeight = Math.ceil(doc.documentElement.getBoundingClientRect().height) + 4;
    setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, contentHeight)));
  }, [original]);


  // A width change (the slider, a rotated phone, a resized window) re-lays the preview out.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => { refresh(); });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [refresh]);

  const edited = css !== original.css || html !== original.html;
  const editorValue = tab === 'css' ? css : html;
  const lines = editorValue.split('\n').length;

  const onEdit = (value: string) => {
    if (tab === 'css') { setCss(value); refresh({ css: value }); } else { setHtml(value); refresh({ html: value }); }
  };

  const reset = () => {
    setCss(original.css);
    setHtml(original.html);
    refresh({ css: original.css, html: original.html });
  };

  const toggleOutlines = () => {
    setOutlines(!outlines);
    refresh({ outlines: !outlines });
  };

  return (
    <div className="live-css my-6 overflow-hidden rounded-md border border-line bg-surface shadow-sm">
      <div className="code-block-header">
        <div className="flex items-center gap-1" role="group" aria-label="Edit">
          {(['css', 'html'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
              className={cn('rounded px-2 py-0.5 font-mono text-xs uppercase tracking-wider',
                tab === t ? 'bg-[#444c56] text-white' : 'text-[#adbac7] hover:text-white')}>
              {t}
            </button>
          ))}
          <span className="ml-2 text-xs text-[#adbac7]">live: edit to see the change</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleOutlines} aria-pressed={outlines} className="copy-btn" title="Outline every box">
            <SquareDashed size={12} /><span>Boxes</span>
          </button>
          {edited && (
            <button onClick={reset} className="copy-btn" aria-label="Reset to the original code">
              <RotateCcw size={12} /><span>Reset</span>
            </button>
          )}
        </div>
      </div>
      <textarea
        value={editorValue}
        onChange={(e) => onEdit(e.target.value)}
        rows={Math.min(lines + 1, 16)}
        spellCheck={false}
        wrap="off"
        autoCapitalize="off"
        autoCorrect="off"
        aria-label={tab === 'css' ? 'CSS for this demo' : 'HTML for this demo'}
        className="block w-full resize-y border-0 bg-[#22272e] px-4 py-3 font-mono text-[13px] leading-relaxed text-[#adbac7] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-xs text-muted">
        <span className="font-semibold uppercase tracking-wider">Preview</span>
        <label className="flex items-center gap-2">
          <span>Width: {width === null ? 'full' : `${width}px`}</span>
          <input type="range" min={240} max={900} step={10} value={width ?? 900}
            onChange={(e) => setWidth(Number(e.target.value) >= 900 ? null : Number(e.target.value))}
            className="w-28 accent-accent" />
        </label>
      </div>
      <div className="overflow-x-auto bg-canvas px-4 pb-4">
        <iframe
          ref={frameRef}
          title="Live preview of the CSS above"
          sandbox="allow-same-origin"
          srcDoc={LIVE_CSS_DOC}
          onLoad={() => refresh()}
          style={{ height, width: width === null ? '100%' : width }}
          className="block max-w-none rounded border border-line bg-white"
        />
      </div>
      <Readout items={items} baseline={baseline} />
    </div>
  );
}
