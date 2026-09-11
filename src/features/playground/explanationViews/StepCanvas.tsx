import React, { Fragment } from 'react';
import { Award, AlertCircle } from 'lucide-react';
import type { ExplanationStep } from '../../../data/playground/playgroundExplanations';
import {
  ArrayView, MapView, ComputationView, StackView, SetView,
  DualArrayView, CallStackView, LinkedListView, TimelineView, LookupView,
} from './index';

/**
 * The right-hand visual panel of the Explain modal.
 *
 * A step can carry any combination of ten snapshot kinds, so picking the
 * renderers was a chain of ten conditionals plus a twelve-clause negation for
 * the "nothing to show" fallback. That gave ExplanationModal a cyclomatic
 * complexity of 46, and the negation had to be hand-updated every time a
 * snapshot kind was added — which is the kind of duplication that silently
 * rots.
 *
 * The table below is the single source of truth instead: adding a snapshot
 * kind means adding one row, and the fallback derives from the same rows.
 */
const VISUAL_RENDERERS: {
  key: keyof ExplanationStep;
  render: (step: ExplanationStep) => React.ReactNode;
}[] = [
  { key: 'array',         render: (s) => s.array && <ArrayView array={s.array} /> },
  { key: 'linkedList',    render: (s) => s.linkedList && <LinkedListView snapshot={s.linkedList} /> },
  { key: 'dualArray',     render: (s) => s.dualArray && <DualArrayView snapshot={s.dualArray} /> },
  { key: 'computation',   render: (s) => s.computation && <ComputationView c={s.computation} /> },
  { key: 'lookupOutcome', render: (s) => s.lookupOutcome && <LookupView outcome={s.lookupOutcome} /> },
  { key: 'map',           render: (s) => s.map && <MapView snapshot={s.map} /> },
  { key: 'set',           render: (s) => s.set && <SetView snapshot={s.set} /> },
  { key: 'stack',         render: (s) => s.stack && <StackView snapshot={s.stack} /> },
  { key: 'callStack',     render: (s) => s.callStack && <CallStackView snapshot={s.callStack} /> },
  { key: 'timeline',      render: (s) => s.timeline && <TimelineView snapshot={s.timeline} /> },
];

/** Every field that counts as "this step shows something". */
const VISUAL_KEYS: (keyof ExplanationStep)[] = [
  ...VISUAL_RENDERERS.map((r) => r.key), 'note', 'result',
];

function ResultBanner({ result }: { result: NonNullable<ExplanationStep['result']> }) {
  const tone = result.found
    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
  return (
    <div className={`mt-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${tone}`}>
      {result.found
        ? <><Award size={14} /> Result: <code className="font-mono">{result.value}</code></>
        : <><AlertCircle size={14} /> No solution found</>}
    </div>
  );
}

export default function StepCanvas({ step }: { step: ExplanationStep }) {
  const hasVisual = VISUAL_KEYS.some((k) => Boolean(step[k]));

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 flex flex-col gap-4">
      {VISUAL_RENDERERS.map(({ key, render }) => (
        <Fragment key={key}>{render(step)}</Fragment>
      ))}

      {step.note && (
        <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
          {step.note}
        </div>
      )}

      {step.result && <ResultBanner result={step.result} />}

      {/* Keeps the panel from looking broken when a step is narrative only. */}
      {!hasVisual && (
        <div className="text-xs text-slate-500 dark:text-slate-500 italic flex items-center justify-center text-center min-h-[120px]">
          No visual change this step — read the title and the highlighted pseudocode line.
        </div>
      )}
    </div>
  );
}
