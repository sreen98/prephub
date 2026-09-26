import React, { useEffect, useMemo, useState } from 'react';
import { X, GitCompare, Loader2 } from 'lucide-react';
import { diffLines, diffStats, pairRows } from '../../lib/lineDiff';
import { playgroundSolutionKeys } from '../../data/playground/playgroundSolutionKeys';
import { getTemplateCode } from '../../data/playground/templateIndex';

// "Compare": the reader's code beside the reference, lines that match on the
// same row. Show Solution REPLACES the reader's code, which is the wrong tool
// once they have an attempt of their own: what they want then is to see where
// the two differ. For a challenge with a reference solution that is the
// comparison; otherwise (React machine coding, reference templates) it is the
// original template, which shows what they changed.
//
// Always dark, like the rest of the IDE surface. Remount with `key={name}`.

export interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  mine: string;
}

type Reference = { text: string; label: string } | { error: string } | null;

async function loadReference(name: string): Promise<{ text: string; label: string }> {
  if (playgroundSolutionKeys.has(name)) {
    const mod = await import('../../data/playground/playgroundSolutions');
    return { text: mod.playgroundSolutions[name] ?? '', label: 'Reference solution' };
  }
  return { text: (await getTemplateCode(name)) ?? '', label: 'Original template' };
}

export default function CompareModal({ open, onClose, name, mine }: CompareModalProps) {
  const [ref, setRef] = useState<Reference>(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadReference(name)
      .then((r) => { if (!cancelled) setRef(r); })
      .catch((e: unknown) => { if (!cancelled) setRef({ error: e instanceof Error ? e.message : String(e) }); });
    return () => { cancelled = true; };
  }, [open, name]);

  const rows = useMemo(() => (ref && 'text' in ref ? pairRows(diffLines(mine, ref.text)) : []), [ref, mine]);
  const stats = useMemo(() => (ref && 'text' in ref ? diffStats(diffLines(mine, ref.text)) : null), [ref, mine]);
  if (!open) return null;

  const cell = (side?: { text: string; no: number; changed: boolean }, tone = '') => (
    <div className={'flex min-w-0 ' + (side?.changed ? tone : '')}>
      <span className="w-10 shrink-0 select-none text-right pr-2 text-slate-500">{side?.no ?? ''}</span>
      <span className="whitespace-pre-wrap break-words min-w-0 flex-1">{side?.text ?? ''}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={`Compare ${name}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="w-[min(1200px,96vw)] h-[min(820px,92vh)] flex flex-col rounded-2xl border border-[#2d333b] bg-[#1c2028] text-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#2d333b]">
          <div className="flex items-center gap-2 min-w-0">
            <GitCompare size={16} className="text-sky-300 shrink-0" />
            <h2 className="font-semibold text-sm truncate">Compare: {name}</h2>
            {stats && (
              <span className="text-xs text-slate-400">
                {stats.same} matching · <span className="text-rose-300">{stats.removed} only yours</span> · <span className="text-emerald-300">{stats.added} only in the reference</span>
              </span>
            )}
          </div>
          <button autoFocus onClick={onClose} aria-label="Close compare" className="p-1.5 rounded-lg hover:bg-[#2d333b] text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#2d333b]">
          <div className="px-4 py-1.5">Your code</div>
          <div className="px-4 py-1.5 border-l border-[#2d333b]">{ref && 'label' in ref ? ref.label : 'Reference'}</div>
        </div>
        <div className="flex-1 overflow-auto font-mono text-[12.5px] leading-5">
          {ref === null && <p className="p-4 text-slate-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading the reference…</p>}
          {ref && 'error' in ref && <p className="p-4 text-rose-300">Could not load the reference: {ref.error}</p>}
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-2">
              {cell(r.left, 'bg-rose-500/10')}
              <div className="border-l border-[#2d333b]">{cell(r.right, 'bg-emerald-500/10')}</div>
            </div>
          ))}
        </div>
        <p className="px-4 py-2 text-[11px] text-slate-400 border-t border-[#2d333b]">
          Lines are matched ignoring indentation. A reference solution often shows several approaches; yours only needs to match one of them in behaviour, not in text.
        </p>
      </div>
    </div>
  );
}
