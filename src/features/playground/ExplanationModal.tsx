import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Award, AlertCircle } from 'lucide-react';
import type {
  Explanation, Approach, ExplanationStep, ArrayCell, MapEntry,
  StackSnapshot, SetSnapshot, DualArraySnapshot, CallStackSnapshot,
  LinkedListSnapshot, TimelineSnapshot,
} from '../../data/playground/playgroundExplanations';
import { ComplexityRow } from './explanationViews';
import StepCanvas from './explanationViews/StepCanvas';

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
  // Both are resets on a changed input; `key` on the modal would be the
  // idiomatic alternative but would also discard the approach selection.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setStepIdx(0); setPlaying(false); }, [activeApproach, explanation]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
                {/* Pseudocode — single column OR side-by-side comparison */}
                {approach.pseudocodeCompare && approach.pseudocodeCompare.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-indigo-300 dark:border-indigo-700/60 bg-[#0f1117] overflow-hidden">
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-indigo-400 border-b border-slate-800">
                        {approach.pseudocodeLabel ?? 'Primary'} <span className="text-slate-500">· this one</span>
                      </div>
                      <pre className="p-2 text-[11px] leading-relaxed font-mono">
                        {approach.pseudocode.map((line, i) => (
                          <div
                            key={i}
                            className={
                              'px-1.5 py-0.5 rounded transition-colors ' +
                              (i === step.pseudoLine
                                ? 'bg-indigo-500/20 text-indigo-200 border-l-2 border-indigo-400 -ml-0.5'
                                : 'text-slate-400 border-l-2 border-transparent -ml-0.5')
                            }
                          >
                            {line || ' '}
                          </div>
                        ))}
                      </pre>
                    </div>
                    {approach.pseudocodeCompare.map(block => (
                      <div key={block.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0f1117] overflow-hidden">
                        <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-800">
                          {block.label} <span className="text-slate-600">· compare</span>
                        </div>
                        <pre className="p-2 text-[11px] leading-relaxed font-mono">
                          {block.lines.map((line, i) => (
                            <div
                              key={i}
                              className={
                                'px-1.5 py-0.5 rounded transition-colors ' +
                                (i === block.highlightLine
                                  ? 'bg-amber-500/15 text-amber-200 border-l-2 border-amber-500/60 -ml-0.5'
                                  : 'text-slate-500 border-l-2 border-transparent -ml-0.5')
                              }
                            >
                              {line || ' '}
                            </div>
                          ))}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}

                {/* Visual */}
                <StepCanvas step={step} />
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













