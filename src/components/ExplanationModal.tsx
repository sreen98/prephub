import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Award, AlertCircle } from 'lucide-react';
import type {
  Explanation, Approach, ExplanationStep, ArrayCell, MapEntry,
  StackSnapshot, SetSnapshot, DualArraySnapshot, CallStackSnapshot,
  LinkedListSnapshot, TimelineSnapshot,
} from './playgroundExplanations';

interface Props {
  open: boolean;
  explanation: Explanation | null;
  onClose: () => void;
  /** Loads a polyfill template by name. Called when the user clicks a polyfill chip. */
  onLoadTemplate?: (templateName: string) => void;
}

export default function ExplanationModal({ open, explanation, onClose, onLoadTemplate }: Props) {
  const [activeApproach, setActiveApproach] = useState<number>(0);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);

  const approach: Approach | null = explanation?.approaches[activeApproach] ?? null;
  const totalSteps: number = approach?.steps.length ?? 0;
  const step: ExplanationStep | null = approach?.steps[stepIdx] ?? null;

  // Reset step + auto-play when switching approach or opening fresh.
  useEffect(() => { setStepIdx(0); setPlaying(false); }, [activeApproach, explanation]);
  useEffect(() => { if (!open) { setActiveApproach(0); setStepIdx(0); setPlaying(false); } }, [open]);

  // Keyboard navigation while modal is open.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setStepIdx(s => Math.min(totalSteps - 1, s + 1));
      else if (e.key === 'ArrowLeft') setStepIdx(s => Math.max(0, s - 1));
      else if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, totalSteps]);

  // Auto-play timer.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setStepIdx(s => {
        if (s >= totalSteps - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [playing, totalSteps]);

  const next = useCallback(() => setStepIdx(s => Math.min(totalSteps - 1, s + 1)), [totalSteps]);
  const prev = useCallback(() => setStepIdx(s => Math.max(0, s - 1)), []);
  const reset = useCallback(() => { setStepIdx(0); setPlaying(false); }, []);

  if (!explanation || !approach || !step) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-xl font-bold">{explanation.problem} — Explained</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {explanation.problemStatement}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Approach tabs */}
            <div className="flex gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              {explanation.approaches.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setActiveApproach(i)}
                  className={
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-colors ' +
                    (i === activeApproach
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200')
                  }
                >
                  {a.badge === 'best' && <Award size={14} className="text-amber-500" />}
                  {a.name}
                </button>
              ))}
            </div>

            {/* Body — scrolls if content tall */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Intuition + complexity */}
              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <div className="md:col-span-2 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5">Intuition</div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{approach.intuition}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Complexity</div>
                  <ComplexityRow label="Time" value={approach.complexity.time} />
                  <ComplexityRow label="Space" value={approach.complexity.space} />
                  <div className="text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 italic">
                    {approach.complexity.verdict}
                  </div>
                </div>
              </div>

              {/* Example */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-500 font-medium">Example</span>
                <code className="px-2 py-1 rounded-md bg-slate-900 text-emerald-300 font-mono">{approach.example.input}</code>
                <span className="text-slate-400">→</span>
                <code className="px-2 py-1 rounded-md bg-slate-900 text-amber-300 font-mono">{approach.example.output}</code>
              </div>

              {/* Visual + pseudocode side by side */}
              <div className="grid md:grid-cols-[1fr_1.2fr] gap-4 mb-4">
                {/* Pseudocode */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0f1117] overflow-hidden">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-800">Pseudocode</div>
                  <pre className="p-3 text-xs leading-relaxed font-mono">
                    {approach.pseudocode.map((line, i) => (
                      <div
                        key={i}
                        className={
                          'px-2 py-0.5 rounded transition-colors ' +
                          (i === step.pseudoLine
                            ? 'bg-indigo-500/20 text-indigo-200 border-l-2 border-indigo-400 -ml-0.5'
                            : 'text-slate-400 border-l-2 border-transparent -ml-0.5')
                        }
                      >
                        {line || ' '}
                      </div>
                    ))}
                  </pre>
                </div>

                {/* Visual */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 flex flex-col gap-4">
                  {step.array && <ArrayView array={step.array} />}
                  {step.linkedList && <LinkedListView snapshot={step.linkedList} />}
                  {step.dualArray && <DualArrayView snapshot={step.dualArray} />}
                  {step.computation && <ComputationView c={step.computation} />}
                  {step.lookupOutcome && <LookupView outcome={step.lookupOutcome} />}
                  {step.map && <MapView snapshot={step.map} />}
                  {step.set && <SetView snapshot={step.set} />}
                  {step.stack && <StackView snapshot={step.stack} />}
                  {step.callStack && <CallStackView snapshot={step.callStack} />}
                  {step.timeline && <TimelineView snapshot={step.timeline} />}
                  {step.note && (
                    <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                      {step.note}
                    </div>
                  )}
                  {step.result && (
                    <div className={
                      'mt-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ' +
                      (step.result.found
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300')
                    }>
                      {step.result.found
                        ? <><Award size={14} /> Result: <code className="font-mono">{step.result.value}</code></>
                        : <><AlertCircle size={14} /> No solution found</>}
                    </div>
                  )}
                  {/* Fallback when a step has no visual data — keeps the panel from looking blank. */}
                  {!step.array && !step.linkedList && !step.dualArray && !step.computation
                    && !step.lookupOutcome && !step.map && !step.set && !step.stack
                    && !step.callStack && !step.timeline && !step.note && !step.result && (
                    <div className="text-xs text-slate-500 dark:text-slate-500 italic flex items-center justify-center text-center min-h-[120px]">
                      No visual change this step — read the title and the highlighted pseudocode line.
                    </div>
                  )}
                </div>
              </div>

              {/* Step description */}
              <div className="mt-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step {stepIdx + 1} of {totalSteps}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{step.title}</p>
                {step.detail && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{step.detail}</p>}
              </div>

              {/* Polyfill references — built-ins this approach uses that have a polyfill template */}
              {approach.usesPolyfills && approach.usesPolyfills.length > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                    Built-ins used (peek under the hood)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    This approach leans on the following array/object built-ins. Click any chip to open its polyfill template and study how it's implemented internally.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {approach.usesPolyfills.map((p) => (
                      <button
                        key={p.builtin}
                        onClick={() => {
                          if (onLoadTemplate) {
                            onLoadTemplate(p.templateName);
                            onClose();
                          }
                        }}
                        disabled={!onLoadTemplate}
                        className="group inline-flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-900/60 border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm transition-all disabled:cursor-default disabled:hover:border-amber-200 disabled:hover:shadow-none"
                        title={onLoadTemplate ? `Open the ${p.templateName} polyfill template` : undefined}
                      >
                        <code className="text-xs font-mono text-amber-700 dark:text-amber-300 group-hover:text-amber-900 dark:group-hover:text-amber-200">
                          {p.builtin}
                        </code>
                        {p.why && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            {p.why}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tradeoffs */}
              <details className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <summary className="px-4 py-2.5 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                  When to pick this approach
                </summary>
                <p className="px-4 pb-3 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{approach.tradeoffs}</p>
              </details>
            </div>

            {/* Footer — step navigator */}
            <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 shrink-0">
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Reset"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  disabled={stepIdx === 0}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Previous step"
                >
                  <ChevronLeft size={16} />
                </button>
                {/* Dot indicator */}
                <div className="flex gap-1.5 px-2">
                  {approach.steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStepIdx(i)}
                      className={
                        'w-2 h-2 rounded-full transition-all ' +
                        (i === stepIdx
                          ? 'bg-indigo-500 w-4'
                          : i < stepIdx ? 'bg-indigo-300 dark:bg-indigo-800' : 'bg-slate-300 dark:bg-slate-700')
                      }
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setPlaying(p => !p)}
                  className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                  aria-label={playing ? 'Pause' : 'Auto-play'}
                  title={playing ? 'Pause' : 'Auto-play (Space)'}
                >
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={next}
                  disabled={stepIdx >= totalSteps - 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Next step"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 hidden md:inline">← → arrows · Space to play</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============== Sub-views ==============

function ComplexityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-xs py-0.5">
      <span className="text-slate-500">{label}</span>
      <code className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{value}</code>
    </div>
  );
}

function ArrayView({ array }: { array: NonNullable<ExplanationStep['array']> }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Array</div>
      <div className="flex gap-1.5 flex-wrap">
        {array.cells.map((cell, i) => (
          <CellView key={i} index={i} cell={cell} />
        ))}
      </div>
      {array.pointers && array.pointers.length > 0 && (
        <div className="flex gap-1.5 mt-1 flex-wrap" aria-hidden>
          {array.cells.map((_, i) => {
            const ps = array.pointers!.filter(p => p.index === i);
            return (
              <div key={i} className="w-12 flex flex-col items-center gap-0.5 min-h-[1.5rem]">
                {ps.map((p, k) => (
                  <span key={k} className={
                    'text-[10px] font-bold ' +
                    (p.color === 'red' ? 'text-red-500'
                      : p.color === 'amber' ? 'text-amber-500'
                      : p.color === 'emerald' ? 'text-emerald-500'
                      : 'text-indigo-500')
                  }>↑ {p.label}</span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CellView({ index, cell }: { index: number; cell: ArrayCell }) {
  const baseRing = 'border-2';
  const cls = (() => {
    switch (cell.highlight) {
      case 'i': return 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300';
      case 'j': return 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';
      case 'compare': return 'border-blue-400 bg-blue-50 dark:bg-blue-950/30';
      case 'found': return 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-md';
      case 'hit': return 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';
      case 'new': return 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30';
      default: return 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900';
    }
  })();
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-slate-400 font-mono">[{index}]</span>
      <div className={`w-12 h-12 rounded-lg ${baseRing} ${cls} flex items-center justify-center font-mono text-sm font-semibold transition-all`}>
        {cell.value}
      </div>
    </div>
  );
}

function MapView({ snapshot }: { snapshot: NonNullable<ExplanationStep['map']> }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Hash Map</div>
      {snapshot.entries.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">
          {'{ }'} (empty)
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {snapshot.entries.map((e, i) => <MapEntryView key={i} entry={e} />)}
        </div>
      )}
    </div>
  );
}

function MapEntryView({ entry }: { entry: MapEntry }) {
  const cls = entry.highlight === 'hit'
    ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 shadow-md'
    : entry.highlight === 'new'
    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-200'
    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
  return (
    <div className={`px-2.5 py-1.5 rounded-lg border-2 ${cls} transition-all`}>
      <code className="font-mono text-xs">{entry.key} <span className="text-slate-400">→</span> {entry.value}</code>
    </div>
  );
}

function ComputationView({ c }: { c: NonNullable<ExplanationStep['computation']> }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">{c.label}</div>
      <div className="flex items-center gap-2 font-mono text-sm flex-wrap">
        {c.lhs && <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">{c.lhs}</span>}
        {c.op && <span className="text-slate-500">{c.op}</span>}
        {c.rhs && <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">{c.rhs}</span>}
        {c.result && (
          <>
            <span className="text-slate-500">=</span>
            <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-800">{c.result}</span>
          </>
        )}
      </div>
    </div>
  );
}

function StackView({ snapshot }: { snapshot: StackSnapshot }) {
  const top = snapshot.items.length - 1;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Stack {snapshot.action && <span className="ml-1 text-indigo-500">· {snapshot.action}</span>}
      </div>
      {snapshot.items.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">[ ] (empty)</div>
      ) : (
        <div className="flex flex-col-reverse gap-1 w-fit">
          {snapshot.items.map((cell, i) => (
            <div key={i} className="flex items-center gap-2">
              <CellView index={i} cell={cell} />
              {i === top && <span className="text-[10px] text-indigo-500 font-bold">← top</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SetView({ snapshot }: { snapshot: SetSnapshot }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Set</div>
      {snapshot.items.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">{'{ }'} (empty)</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {snapshot.items.map((it, i) => {
            const cls = it.highlight === 'hit'
              ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200'
              : it.highlight === 'new'
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-200'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
            return (
              <div key={i} className={`px-2.5 py-1 rounded-full border-2 ${cls}`}>
                <code className="font-mono text-xs">{it.value}</code>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DualArrayView({ snapshot }: { snapshot: DualArraySnapshot }) {
  return (
    <div className="flex flex-col gap-3">
      {[snapshot.left, snapshot.right].map((side, idx) => (
        <div key={idx}>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">{side.label}</div>
          <div className="flex gap-1.5 flex-wrap">
            {side.cells.map((c, i) => <CellView key={i} index={i} cell={c} />)}
          </div>
          {typeof side.pointer === 'number' && (
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {side.cells.map((_, i) => (
                <div key={i} className="w-12 flex justify-center">
                  {i === side.pointer && <span className="text-[10px] font-bold text-indigo-500">↑</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {snapshot.result && (
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">{snapshot.result.label}</div>
          <div className="flex gap-1.5 flex-wrap">
            {snapshot.result.cells.length === 0 ? (
              <div className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">[ ]</div>
            ) : snapshot.result.cells.map((c, i) => <CellView key={i} index={i} cell={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function CallStackView({ snapshot }: { snapshot: CallStackSnapshot }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Call Stack</div>
      <div className="flex flex-col-reverse gap-1">
        {snapshot.frames.map((f, i) => {
          const cls = f.status === 'active'
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-200'
            : f.status === 'returned'
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400';
          return (
            <div key={i} className={`px-3 py-1.5 rounded-md border-2 ${cls} font-mono text-xs flex items-center justify-between`}>
              <span>{f.call}</span>
              {f.returns !== undefined && <span className="text-emerald-600 dark:text-emerald-400 ml-2">→ {f.returns}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LinkedListView({ snapshot }: { snapshot: LinkedListSnapshot }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Linked List</div>
      {snapshot.nodes.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">null (empty)</div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          {snapshot.nodes.map((n, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-0.5">
                {n.label && <span className="text-[10px] font-bold text-indigo-500">{n.label}</span>}
                <CellView index={i} cell={{ value: n.value, highlight: n.highlight }} />
              </div>
              {i < snapshot.nodes.length - 1 && <span className="text-slate-400 font-mono">→</span>}
            </React.Fragment>
          ))}
          <span className="text-slate-400 font-mono">→ {snapshot.tail ?? 'null'}</span>
        </div>
      )}
    </div>
  );
}

function TimelineView({ snapshot }: { snapshot: TimelineSnapshot }) {
  const maxT = Math.max(1, ...snapshot.events.map(e => e.t));
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Timeline {snapshot.windowMs && <span className="ml-1 text-indigo-500">· window {snapshot.windowMs}ms</span>}
      </div>
      <div className="relative h-12 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
        <div className="absolute inset-x-2 top-1/2 h-px bg-slate-300 dark:bg-slate-700" />
        {snapshot.events.map((e, i) => {
          const x = `${(e.t / maxT) * 100}%`;
          const colorCls = e.kind === 'fire'
            ? 'bg-emerald-500 text-white'
            : e.kind === 'input'
            ? 'bg-indigo-500 text-white'
            : e.kind === 'skip'
            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500'
            : 'bg-amber-400 text-white';
          return (
            <div
              key={i}
              style={{ left: x }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorCls} whitespace-nowrap`}
            >
              {e.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LookupView({ outcome }: { outcome: NonNullable<ExplanationStep['lookupOutcome']> }) {
  if (outcome.kind === 'hit') {
    return (
      <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
        ✓ <code className="font-mono mx-1">{outcome.key}</code> is in the map (at index <code className="font-mono">{outcome.at}</code>)
      </div>
    );
  }
  return (
    <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium">
      ✕ <code className="font-mono mx-1">{outcome.key}</code> is not in the map — store the current number and continue
    </div>
  );
}
