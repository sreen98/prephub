import { CheckCircle2, Circle } from 'lucide-react';
import type { Progress } from '../../hooks/usePlaygroundProgress';

/**
 * The two pieces of completion UI in the playground header.
 *
 * They live here rather than inline in CodePlayground because that file sits
 * on a line-count ratchet that may shrink and never grow — and because the
 * chip and the toggle are one idea: what counts as done, and who decides.
 */

interface ChipProps {
  /** Every challenge name — the denominator. */
  challengeNames: string[];
  progress: Progress;
}

/**
 * Counts over CHALLENGES only. The raw solved-entry count would include any
 * template the user merely edited, so the chip could read higher than its own
 * denominator.
 */
export function SolvedChip({ challengeNames, progress }: ChipProps) {
  const solved = challengeNames.filter(n => progress[n]?.status === 'solved').length;
  const total = challengeNames.length;
  return (
    <span
      className="ml-auto md:ml-3 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 font-medium shrink-0 hidden sm:inline"
      title="Challenges you have completed. JS challenges complete themselves when every test passes; the rest you mark yourself."
    >
      {solved} / {total} solved
    </span>
  );
}

interface ToggleProps {
  name: string | null;
  template: { kind?: string; tag?: string } | null;
  progress: Progress;
  onChange: (name: string, solved: boolean) => void;
}

/**
 * Renders only for a challenge. JS challenges complete themselves when a run
 * produces all ✅; React machine-coding templates have no test output to read,
 * so before this they could not be completed at all.
 */
export function CompleteToggle({ name, template, progress, onChange }: ToggleProps) {
  if (!name || template?.kind !== 'challenge') return null;
  const solved = progress[name]?.status === 'solved';
  const autoDetected = template.tag === 'JS';
  return (
    <button
      onClick={() => onChange(name, !solved)}
      aria-pressed={solved}
      title={
        solved
          ? 'Completed — click to un-mark'
          : autoDetected
            ? 'Mark as complete (also happens automatically when every test passes)'
            : 'Mark as complete'
      }
      className={
        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors '
        + (solved
          ? 'border-emerald-700/60 bg-emerald-900/25 text-emerald-400 hover:bg-emerald-900/40'
          : 'border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white')
      }
    >
      {solved ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      <span className="hidden lg:inline">{solved ? 'Completed' : 'Mark complete'}</span>
    </button>
  );
}
