import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useChallengeProblems } from '../../hooks/useChallengeProblems';
import type { ActiveTrack } from '../../hooks/useChallengeTrack';
import { safeGet, safeSet } from '../../lib/storage';

// The problem statement for the open challenge, above the editor: what to build,
// sample input with the expected output, and the constraints. Before this, the
// only statement was a few comment lines at the top of the code.
//
// Always dark, like the rest of the IDE surface.

export interface ChallengeProblemPanelProps {
  name: string;
  isReact: boolean;
  active: ActiveTrack | null;
  onGo: (name: string) => void;
}

function TrackNav({ active, onGo }: { active: ActiveTrack; onGo: (name: string) => void }) {
  const step = 'inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-[#3d444d] text-[11px] text-slate-300 hover:bg-[#2d333b] disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <span className="flex items-center gap-2 text-[11px] text-slate-400">
      <span className="hidden sm:inline">Track: <span className="text-emerald-300 font-medium">{active.track.title}</span> · {active.index + 1} of {active.track.names.length}</span>
      <button className={step} disabled={!active.prev} onClick={() => active.prev && onGo(active.prev)} title={active.prev ?? undefined}>
        <ChevronLeft size={12} /> Prev
      </button>
      <button className={step} disabled={!active.next} onClick={() => active.next && onGo(active.next)} title={active.next ?? undefined}>
        Next <ChevronRight size={12} />
      </button>
    </span>
  );
}

// The panel's height is the reader's choice: dragged like the editor/output
// split, and remembered the same way. Clamped so neither the statement nor the
// editor can be squeezed to nothing.
const HEIGHT_KEY = 'playground-problem-height';
const MIN_PX = 80;
const viewport = (): number => (typeof window === 'undefined' ? 900 : window.innerHeight);
const clampHeight = (px: number): number => Math.round(Math.max(MIN_PX, Math.min(viewport() * 0.75, px)));
const defaultHeight = (): number => clampHeight(viewport() * 0.38);

function useResizableHeight() {
  const [height, setHeight] = useState<number>(() => {
    const stored = parseFloat(safeGet(HEIGHT_KEY) ?? '');
    return Number.isFinite(stored) ? clampHeight(stored) : defaultHeight();
  });
  useEffect(() => { safeSet(HEIGHT_KEY, String(height)); }, [height]);
  const drag = useRef<{ y: number; h: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, h: height };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [height]);
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current) setHeight(clampHeight(drag.current.h + e.clientY - drag.current.y));
  }, []);
  const onPointerUp = useCallback(() => {
    drag.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 80 : 20;
    if (e.key === 'ArrowUp') { e.preventDefault(); setHeight((h) => clampHeight(h - step)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHeight((h) => clampHeight(h + step)); }
  }, []);
  const reset = useCallback(() => setHeight(defaultHeight()), []);
  return { height, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown, onDoubleClick: reset } };
}

export default function ChallengeProblemPanel({ name, isReact, active, onGo }: ChallengeProblemPanelProps) {
  const [open, setOpen] = useState(true);
  const { height, handlers } = useResizableHeight();
  const problems = useChallengeProblems();
  const problem = problems?.[name];

  return (
    <div className="border-b border-[#2d333b] bg-[#1a1c25] shrink-0 text-slate-200">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white">
          <FileText size={13} /> Problem
          <ChevronDown size={13} className={open ? 'transition-transform' : '-rotate-90 transition-transform'} />
        </button>
        {active && <TrackNav active={active} onGo={onGo} />}
      </div>
      {open && (
        <div style={{ height }} className="px-4 pb-3 overflow-y-auto text-sm leading-relaxed">
          {!problems && <p className="text-slate-500">Loading the problem…</p>}
          {problems && !problem && <p className="text-slate-500">The statement for this challenge is in the comments at the top of the code.</p>}
          {problem && (
            <>
              <p className="text-slate-200">{problem.statement}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg border border-[#2d333b] bg-[#22272e] p-2.5 font-mono text-[12.5px]">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-sans mb-1">Example {i + 1}</p>
                    <p><span className="text-slate-500">{isReact ? 'You do: ' : 'Input: '}</span><span className="text-sky-300 whitespace-pre-wrap">{ex.input}</span></p>
                    <p><span className="text-slate-500">{isReact ? 'You see: ' : 'Output: '}</span><span className="text-emerald-300 whitespace-pre-wrap">{ex.output}</span></p>
                    {ex.explanation && <p className="mt-1 font-sans text-xs text-slate-400">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{isReact ? 'Requirements' : 'Constraints'}</p>
                  <ul className="list-disc pl-5 text-xs text-slate-300 space-y-0.5">
                    {problem.constraints.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {open && (
        <div
          role="separator" aria-orientation="horizontal" aria-label="Resize the problem panel"
          aria-valuenow={height} aria-valuemin={MIN_PX} tabIndex={0}
          title="Drag to resize · double-click to reset"
          className="group h-2 -mb-1 relative z-10 cursor-row-resize flex items-center justify-center focus:outline-none"
          {...handlers}
        >
          <div className="w-10 h-0.5 rounded-full bg-slate-600 group-hover:bg-white group-focus-visible:bg-white transition-colors" />
        </div>
      )}
    </div>
  );
}
