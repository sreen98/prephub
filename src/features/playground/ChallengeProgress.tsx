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
  /** Every challenge name — the denominator while a challenge is open. */
  challengeNames: string[];
  /** Every reference-template name — the denominator while one of those is open. */
  referenceNames: string[];
  progress: Progress;
  /** The template currently open, so the chip counts the set you are looking at. */
  current: { kind?: string } | null;
}

/**
 * Counts over a NAMED set, never over the raw progress map — that map gains an
 * entry for any template the user merely edited, so counting it would let the
 * chip read higher than its own denominator.
 *
 * Which set depends on what is open. Reference templates used to have no way to
 * be completed at all, while the picker still displayed "0/51" beside them
 * forever; they are now marked the same way, so the chip has to be able to
 * report that progress rather than only the challenge total.
 */
export function SolvedChip({ challengeNames, referenceNames, progress, current }: ChipProps) {
  const onReference = current != null && current.kind !== 'challenge';
  const names = onReference ? referenceNames : challengeNames;
  const done = names.filter(n => progress[n]?.status === 'solved').length;
  return (
    <span
      className="ml-auto md:ml-3 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 font-medium shrink-0 hidden sm:inline"
      title={
        onReference
          ? 'Reference templates you have marked as read. Use "Mark complete" in the toolbar.'
          : 'Challenges you have completed. JS challenges complete themselves when every test passes; the rest you mark yourself.'
      }
    >
      {done} / {names.length} {onReference ? 'read' : 'solved'}
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
 * Renders for ANY open template. JS challenges also complete themselves when a
 * run produces all ✅; everything else — React machine-coding, and the 51
 * reference templates including the polyfills — is marked by hand, because
 * there is no test output to read. Reference templates were excluded at first,
 * which left the picker showing "0/32" next to the polyfills with no way to
 * ever move it.
 */
export function CompleteToggle({ name, template, progress, onChange }: ToggleProps) {
  if (!name || !template) return null;
  const solved = progress[name]?.status === 'solved';
  const isChallenge = template.kind === 'challenge';
  const autoDetected = isChallenge && template.tag === 'JS';
  return (
    <button
      onClick={() => onChange(name, !solved)}
      aria-pressed={solved}
      title={
        solved
          ? 'Completed — click to un-mark'
          : autoDetected
            ? 'Mark as complete (also happens automatically when every test passes)'
            : isChallenge
              ? 'Mark as complete'
              : 'Mark as read'
      }
      className={
        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors '
        + (solved
          ? 'border-emerald-700/60 bg-emerald-900/25 text-emerald-400 hover:bg-emerald-900/40'
          : 'border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white')
      }
    >
      {solved ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      <span className="hidden lg:inline">
        {solved ? 'Completed' : isChallenge ? 'Mark complete' : 'Mark read'}
      </span>
    </button>
  );
}
