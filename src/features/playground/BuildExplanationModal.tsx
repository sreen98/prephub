import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, AlertTriangle, ClipboardList, CheckCircle2 } from 'lucide-react';
import type { BuildExplanation } from '../../data/playground/playgroundExplanations';
import { highlightCode } from '../../lib/editorHighlight';
import { sliceExcerpt } from '../../lib/buildExcerpt';

interface Props {
  open: boolean;
  explanation: BuildExplanation;
  /**
   * The template's own source. Steps point AT it by anchor rather than
   * restating it, so what the modal shows is always the code the reader has
   * open — the first version carried hand-written snippets and 360 of 454
   * lines described an implementation the template did not have.
   */
  templateCode?: string;
  onClose: () => void;
}

/**
 * Walkthrough for a machine-coding template: the brief, the order you would
 * build it in, and what an interviewer grades.
 *
 * Deliberately NOT the algorithm stepper. That one wants a Big-O row,
 * pseudocode and a data structure to animate; a UI component has none of those,
 * which is why every React template shipped with no Explain button. Here the
 * unit of progress is a build step, and each step shows only ITS snippet — the
 * point is to break a 100-line template into pieces you can hold in your head,
 * not to replay it.
 */
export default function BuildExplanationModal({ open, explanation, templateCode, onClose }: Props) {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const total = explanation.buildOrder.length;

  // Reset to step 1 whenever a different template is opened.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setStepIdx(0); }, [explanation]);

  const next = useCallback(() => setStepIdx(s => Math.min(total - 1, s + 1)), [total]);
  const prev = useCallback(() => setStepIdx(s => Math.max(0, s - 1)), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, next, prev]);

  const step = explanation.buildOrder[stepIdx];
  if (!step) return null;
  const excerpt = step.excerpt && templateCode
    ? sliceExcerpt(templateCode, step.excerpt.from, step.excerpt.lines)
    : null;

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
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-xl font-bold">{explanation.problem}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">How to build it, in order</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0" aria-label="Close explanation">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 mb-5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5">
                  <ClipboardList size={13} /> The brief
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{explanation.problemStatement}</p>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Build it in this order
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {explanation.buildOrder.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => setStepIdx(i)}
                    aria-current={i === stepIdx ? 'step' : undefined}
                    title={s.title}
                    className={
                      'w-8 h-8 rounded-lg text-xs font-bold transition-colors '
                      + (i === stepIdx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700')
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <span className="text-indigo-600 dark:text-indigo-400">{stepIdx + 1}.</span> {step.title}
                  </h3>
                </div>

                {excerpt && (
                  <div>
                    <div className="px-4 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      From this template
                    </div>
                    <pre className="text-[12.5px] leading-relaxed p-4 overflow-x-auto bg-[#22272e] text-slate-200 hljs">
                      <code dangerouslySetInnerHTML={{ __html: highlightCode(excerpt, 'tsx') }} />
                    </pre>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step.detail}</p>
                  {step.pitfall && (
                    <div className="flex gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/40">
                      <AlertTriangle size={15} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-amber-900 dark:text-amber-200 leading-relaxed">{step.pitfall}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  <CheckCircle2 size={13} /> What an interviewer is grading
                </div>
                <ul className="space-y-2.5">
                  {explanation.graded.map(g => (
                    <li key={g.point} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{g.point}</div>
                      <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{g.why}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-[#0b0d12]">
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Step {stepIdx + 1} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  disabled={stepIdx === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  onClick={next}
                  disabled={stepIdx === total - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
