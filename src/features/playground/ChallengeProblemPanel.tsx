import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import { useChallengeProblems } from '../../hooks/useChallengeProblems';
import type { ActiveTrack } from '../../hooks/useChallengeTrack';
import { warmUpOf } from '../../data/playground/challengeProblemIndex';

// The problem statement for the open challenge: what to build, sample input with
// the expected output, and the constraints. It used to sit above the editor and
// take a third of its height; it is now a dialog, opened by the Problem button
// in the editor toolbar (and on its own when a challenge starts fresh), so the
// editor keeps the whole column.
//
// Always dark, like the rest of the IDE surface.

export interface ChallengeProblemPanelProps {
  name: string;
  isReact: boolean;
  active: ActiveTrack | null;
  onGo: (name: string) => void;
  open: boolean;
  onClose: () => void;
}

function TrackNav({ active, onGo }: { active: ActiveTrack; onGo: (name: string) => void }) {
  const step = 'inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-[#36332e] text-[11px] text-stone-300 hover:bg-[#262421] disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <span className="flex items-center gap-2 text-[11px] text-stone-400">
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

/** The toolbar button that opens the dialog. */
export function ProblemButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border border-teal-600/60 bg-teal-900/30 text-teal-200 hover:bg-teal-900/50 transition-colors whitespace-nowrap"
      title="Read the problem statement"
    >
      <FileText size={11} /> Problem
    </button>
  );
}

export default function ChallengeProblemPanel({ name, isReact, active, onGo, open, onClose }: ChallengeProblemPanelProps) {
  const problems = useChallengeProblems();
  const problem = problems?.[name];
  const warmUp = problems ? warmUpOf(problems, name) : null;
  const startRef = useRef<HTMLButtonElement>(null);

  // Escape closes; focus lands on "Start coding" so Enter dismisses it too.
  useEffect(() => {
    if (!open) return;
    startRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh]" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="problem-title"
        className="w-full max-w-3xl rounded-xl border border-[#36332e] bg-[#171614] text-stone-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#262421] px-5 py-3">
          <h2 id="problem-title" className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileText size={15} className="text-teal-300" /> {name}
          </h2>
          <div className="flex items-center gap-3">
            {active && <TrackNav active={active} onGo={onGo} />}
            <button onClick={onClose} aria-label="Close the problem" className="rounded p-1 text-stone-400 hover:bg-[#262421] hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 text-sm leading-relaxed">
          {!problems && <p className="text-stone-500">Loading the problem…</p>}
          {problems && !problem && <p className="text-stone-500">The statement for this challenge is in the comments at the top of the code.</p>}
          {problem && (
            <>
              <p className="text-[15px] text-stone-100">{problem.statement}</p>
              {(problem.warmUpFor || warmUp) && (
                <p className="mt-2 text-xs text-stone-400">
                  {problem.warmUpFor ? 'This is the warm-up for ' : 'Its warm-up, with fewer requirements, is '}
                  <button onClick={() => onGo(problem.warmUpFor ?? warmUp ?? name)} className="font-medium text-teal-300 underline underline-offset-2 hover:text-teal-200">
                    {problem.warmUpFor ?? warmUp}
                  </button>
                  {problem.warmUpFor ? ', which asks for more on the same core.' : '.'}
                </p>
              )}
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg border border-[#262421] bg-[#1a1917] p-3 font-mono text-[12.5px]">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 font-sans mb-1">Example {i + 1}</p>
                    <p><span className="text-stone-500">{isReact ? 'You do: ' : 'Input: '}</span><span className="text-sky-300 whitespace-pre-wrap">{ex.input}</span></p>
                    <p><span className="text-stone-500">{isReact ? 'You see: ' : 'Output: '}</span><span className="text-emerald-300 whitespace-pre-wrap">{ex.output}</span></p>
                    {ex.explanation && <p className="mt-1 font-sans text-xs text-stone-400">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">{isReact ? 'Requirements' : 'Constraints'}</p>
                  <ul className="list-disc pl-5 text-xs text-stone-300 space-y-0.5">
                    {problem.constraints.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end border-t border-[#262421] px-5 py-3">
          <button ref={startRef} onClick={onClose} className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-teal-500">
            Start coding
          </button>
        </div>
      </div>
    </div>
  );
}
