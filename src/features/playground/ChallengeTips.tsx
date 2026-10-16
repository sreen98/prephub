import { useCallback, useEffect, useRef, useState } from 'react';
import { ListChecks, Loader2, X, CheckCircle2 } from 'lucide-react';
import type { BuildExplanation } from '../../data/playground/playgroundExplanations';
import { isBuildExplanation } from '../../data/playground/explanationKind';
import { loadExplanations } from './lazyPlaygroundData';
import RichText, { InlineText } from './explanationViews/RichText';

// The Tips dialog for a React machine-coding challenge: what an interviewer
// grades, then the design choices and follow-ups. These used to be 10-40 line
// comment blocks at the top and bottom of the template, which pushed the code
// off the first screen. They come from the challenge's build explanation, so
// they load with Explain's chunk, on first click.
//
// Always dark, like the rest of the IDE surface.

type Load = { state: 'idle' | 'loading' | 'failed' } | { state: 'ready'; tips: BuildExplanation };

/** The header button and its dialog. Keyed by challenge name by the caller. */
export default function TipsButton({ name }: { name: string }) {
  const [load, setLoad] = useState<Load>({ state: 'idle' });
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const onClick = () => {
    if (load.state === 'ready') { setOpen(true); return; }
    setLoad({ state: 'loading' });
    loadExplanations()
      .then((all) => {
        const e = all[name];
        if (e && isBuildExplanation(e)) { setLoad({ state: 'ready', tips: e }); setOpen(true); }
        else setLoad({ state: 'failed' });
      })
      .catch(() => setLoad({ state: 'failed' }));
  };
  const close = useCallback(() => { setOpen(false); triggerRef.current?.focus(); }, []);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={onClick}
        disabled={load.state === 'loading'}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-amber-600/50 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60"
        title={load.state === 'failed' ? 'The tips could not be loaded. Try again.' : 'What an interviewer grades, plus follow-ups'}
      >
        {load.state === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <ListChecks size={14} />} Tips
      </button>
      {open && load.state === 'ready' && <TipsDialog tips={load.tips} onClose={close} />}
    </>
  );
}

export function TipsDialog({ tips, onClose }: { tips: BuildExplanation; onClose: () => void }) {
  const doneRef = useRef<HTMLButtonElement>(null);

  // Escape closes; focus starts on "Got it" so Enter dismisses it too.
  useEffect(() => {
    doneRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const heading = 'text-[11px] font-semibold text-stone-400 mb-2';
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh]" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="tips-title"
        className="w-full max-w-3xl rounded-xl border border-[#36332e] bg-[#171614] text-stone-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#262421] px-5 py-3">
          <h2 id="tips-title" className="flex items-center gap-2 text-sm font-semibold text-white">
            <ListChecks size={15} className="text-amber-300" /> Tips: {tips.problem}
          </h2>
          <button onClick={onClose} aria-label="Close the tips" className="rounded p-1 text-stone-400 hover:bg-[#262421] hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 text-sm leading-relaxed space-y-5">
          <section>
            <h3 className={heading + ' flex items-center gap-1.5'}><CheckCircle2 size={13} /> What an interviewer grades</h3>
            <ul className="space-y-2">
              {tips.graded.map((g) => (
                <li key={g.point} className="rounded-lg border border-[#262421] bg-[#1a1917] p-3">
                  <p className="text-[13px] font-semibold text-stone-100"><InlineText text={g.point} /></p>
                  <RichText text={g.why} className="mt-0.5 text-[13px] text-stone-400" />
                </li>
              ))}
            </ul>
          </section>
          {tips.tips?.map((s) => (
            <section key={s.title}>
              <h3 className={heading}>{s.title}</h3>
              <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-stone-300">
                {s.points.map((pt) => <li key={pt}><RichText text={pt} /></li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="flex justify-end border-t border-[#262421] px-5 py-3">
          <button ref={doneRef} onClick={onClose} className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-teal-500">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
