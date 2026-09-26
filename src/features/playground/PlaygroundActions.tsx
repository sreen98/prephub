import React from 'react';
import { Play, Trash2, Loader2, BookOpen, Target, Lightbulb, Sparkles, RotateCcw, CheckCircle2, XCircle, GitCompare, FlaskConical } from 'lucide-react';
import type { RunSummary } from '../../lib/challengeJudge';
import { CompleteToggle } from './ChallengeProgress';
import type { usePlaygroundProgress } from '../../hooks/usePlaygroundProgress';
import type { FlatTemplateMeta } from '../../data/playground/templateIndex';

// The playground header's action buttons. Extracted from CodePlayground, which
// is held at a line ceiling that may only shrink, to make room for the separate
// Templates and Challenges entry points.

export interface PlaygroundActionsProps {
  onOpenTemplates: () => void;
  onOpenChallenges: () => void;
  selectedName: string | null;
  currentTemplate: FlatTemplateMeta | null;
  progress: ReturnType<typeof usePlaygroundProgress>['progress'];
  onSetSolved: (name: string, solved: boolean) => void;
  hasExplanation: boolean;
  isLoadingExplain: boolean;
  onExplain: () => void;
  hasSolution: boolean;
  isLoadingSolution: boolean;
  showingSolution: boolean;
  onToggleSolution: () => void;
  onReset: () => void;
  runSummary: RunSummary | null;
  /** Interview mode is running on this challenge: answers stay hidden. */
  locked: boolean;
  interviewSlot?: React.ReactNode;
  onCompare?: () => void;
  /** React machine-coding challenges: drive the preview with the behaviour checks. */
  onCheck?: () => void;
  isChecking?: boolean;
  onClear: () => void;
  onRun: () => void;
  isRunning: boolean;
}

const quiet = 'flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white transition-colors';

export default function PlaygroundActions(p: PlaygroundActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
      {/* Two entry points, not one picker with tabs: reference code (fundamentals,
          polyfills, utilities) and practice problems are different jobs. */}
      <button onClick={p.onOpenTemplates} className={quiet} title="Reference code: fundamentals, polyfills and utilities">
        <BookOpen size={14} /> Templates
      </button>
      <button onClick={p.onOpenChallenges} className={quiet + ' border-emerald-700/60 text-emerald-300'} title="Practice problems, grouped into study tracks">
        <Target size={14} /> Challenges
      </button>
      {p.interviewSlot}
      <CompleteToggle name={p.selectedName} template={p.currentTemplate} progress={p.progress} onChange={p.onSetSolved} />

      {p.onCheck && (
        <button onClick={p.onCheck} disabled={p.isChecking} className={quiet + ' border-sky-700/60 text-sky-200 disabled:opacity-60'} title="Run this challenge's behaviour checks against your live preview">
          {p.isChecking ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />} Check
        </button>
      )}

      {!p.locked && <AnswerButtons {...p} />}

      {/* Reset is available whenever a template is loaded, not only once a draft
          has been autosaved: it used to be missing exactly when someone had just
          mangled their code and the 800 ms autosave had not fired yet. */}
      {p.currentTemplate && (
        <button onClick={p.onReset} className={quiet.replace('text-slate-300', 'text-slate-400')} title="Discard edits and restore this template's original code">
          <RotateCcw size={14} /> Reset
        </button>
      )}

      <SummaryPill summary={p.runSummary} />

      <button onClick={p.onClear} aria-label="Clear output" className="p-2 rounded-xl border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors" title="Clear output">
        <Trash2 size={16} />
      </button>

      <button
        onClick={p.onRun}
        disabled={p.isRunning}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm"
      >
        {p.isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
        {p.isRunning ? 'Running...' : 'Run'}
      </button>
    </div>
  );
}

/** Pass/fail from the last run: visible ✅/❌ lines, plus the hidden tests. */
function SummaryPill({ summary: raw }: { summary: RunSummary | null }) {
  const summary = raw && (raw.pass + raw.fail + (raw.hiddenTotal ?? 0)) > 0 ? raw : null;
  const hiddenFailed = !!summary?.hiddenTotal && summary.hiddenPass !== summary.hiddenTotal;
  const allOk = !!summary && summary.fail === 0 && !hiddenFailed;
  return (
    <>
      {/* Test pass/fail summary, derived from the last run's ✅/❌ markers */}
    {summary && (
      <div
        className={
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium ' +
          (allOk
            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
            : 'bg-red-500/15 text-red-300 border border-red-500/40')
        }
        title="Visible tests from the ✅/❌ lines, plus the hidden tests for this challenge"
      >
        {allOk ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
        {summary.fail === 0
          ? `${summary.pass}/${summary.pass} passed`
          : `${summary.pass}/${summary.pass + summary.fail} — ${summary.fail} failed`}
        {summary.hiddenTotal ? ` · 🔒 ${summary.hiddenPass ?? 0}/${summary.hiddenTotal} hidden` : ''}
      </div>
    )}
    </>
  );
}

/** Explain, Compare and Show Solution: every way of reading the answer, hidden during interview mode. */
function AnswerButtons(p: PlaygroundActionsProps) {
  return (
    <>
      {p.hasExplanation && (
        <button
          onClick={p.onExplain}
          disabled={p.isLoadingExplain}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors disabled:opacity-60"
          title="Step-by-step explanation with visual walkthrough"
        >
          {p.isLoadingExplain ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Explain
        </button>
      )}

      {p.onCompare && (
        <button onClick={p.onCompare} className={quiet} title="Your code beside the reference, differences highlighted">
          <GitCompare size={14} /> Compare
        </button>
      )}

      {p.hasSolution && (
        <button
          onClick={p.onToggleSolution}
          disabled={p.isLoadingSolution}
          className={
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors disabled:opacity-60 ' +
            (p.showingSolution
              ? 'border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              : 'border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white')
          }
          title={p.showingSolution ? 'Switch back to the challenge' : 'Reveal the solution'}
        >
          {p.isLoadingSolution ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
          {p.isLoadingSolution ? 'Loading…' : p.showingSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
      )}
    </>
  );
}
