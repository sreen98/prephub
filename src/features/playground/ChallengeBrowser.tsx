import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Target, Shuffle, Play, CheckCircle2 } from 'lucide-react';
import { allTemplates, type FlatTemplateMeta } from '../../data/playground/templateIndex';
import { challengeTracks, type ChallengeTrack } from '../../data/playground/challengeTracks';
import type { ProgressEntry } from '../../hooks/usePlaygroundProgress';
import { useChallengeProblems } from '../../hooks/useChallengeProblems';
import { bestSolvedMs, formatClock, readHistory } from '../../hooks/useInterviewMode';

// The Challenges browser: challenges grouped into study tracks, so problems that
// use the same technique are tried together, easiest first. It replaces the
// Challenges tab of the template picker, which listed everything as cards with
// no order to work through and no statement of what each problem asks.

type Tag = 'JS' | 'React';

export interface ChallengeBrowserProps {
  open: boolean;
  onClose: () => void;
  selectedName: string | null;
  getEntry: (name: string) => ProgressEntry | null;
  /** Open a challenge; `trackId` is the track it was opened from, or null. */
  onPick: (template: FlatTemplateMeta, trackId: string | null) => void;
  onToast: (message: string) => void;
  /** Open on this track (the one the user is working through). */
  initialTrackId?: string | null;
  /** Show only this tag's challenges, with no JS/React switch. */
  lockedTag?: 'JS' | 'React';
}

const challenges = allTemplates.filter((t) => t.kind === 'challenge');

/** Outside the component: it is only ever called from a click handler. */
function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
const byName = new Map(challenges.map((t) => [t.name, t]));

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Hard: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

function StatusDot({ status }: { status: ProgressEntry['status'] | undefined }) {
  if (status === 'solved') return <CheckCircle2 size={15} className="text-emerald-500 shrink-0" aria-label="Solved" />;
  // A 15 px box, the same as the solved icon, so every row's name starts at the
  // same x. The dot inside must be a block: width and height on an inline span
  // are ignored, which drew a hairline instead of a circle.
  return (
    <span aria-label={status === 'in-progress' ? 'In progress' : 'Not started'} className="inline-flex w-[15px] h-[15px] items-center justify-center shrink-0">
      <span className={'block w-2.5 h-2.5 rounded-full ' + (status === 'in-progress' ? 'bg-amber-400' : 'border border-slate-400 dark:border-slate-500')} />
    </span>
  );
}

function TrackList({ tracks, activeId, onSelect, solvedIn }: {
  tracks: ChallengeTrack[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  solvedIn: (names: string[]) => number;
}) {
  const row = (selected: boolean) =>
    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ' +
    (selected ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60');
  return (
    <nav aria-label="Study tracks" className="w-60 shrink-0 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-2 space-y-0.5">
      <button onClick={() => onSelect(null)} className={row(activeId === null)} aria-current={activeId === null ? 'true' : undefined}>
        All challenges
      </button>
      <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Study tracks</p>
      {tracks.map((t) => {
        const done = solvedIn(t.names);
        return (
          <button key={t.id} onClick={() => onSelect(t.id)} className={row(activeId === t.id)} aria-current={activeId === t.id ? 'true' : undefined}>
            <span className="flex items-center justify-between gap-2">
              <span className="truncate">{t.title}</span>
              <span className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400">{done}/{t.names.length}</span>
            </span>
            <span className="mt-1 block h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <span className="block h-full bg-emerald-500" style={{ width: `${(done / t.names.length) * 100}%` }} />
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function ChallengeRow({ t, position, summary, status, current, onClick, bestMs }: {
  t: FlatTemplateMeta; position: number | null; summary: string | undefined; bestMs: number | null;
  status: ProgressEntry['status'] | undefined; current: boolean; onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        aria-current={current ? 'true' : undefined}
        className={'w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ' +
          (current ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50')}
      >
        {position !== null && <span className="w-5 text-right text-xs tabular-nums text-slate-600 dark:text-slate-400 pt-0.5">{position}</span>}
        <span className="pt-0.5"><StatusDot status={status} /></span>
        <span className="flex-1 min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{t.name}</span>
            {t.difficulty && <span className={'text-[10px] font-semibold px-1.5 py-0.5 rounded ' + DIFFICULTY_STYLE[t.difficulty]}>{t.difficulty}</span>}
            {t.patterns?.map((p) => (
              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{p}</span>
            ))}
            {bestMs !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" title="Your fastest solve in interview mode">⏱ {formatClock(bestMs)}</span>
            )}
          </span>
          {summary && <span className="block mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{summary}</span>}
        </span>
      </button>
    </li>
  );
}

export default function ChallengeBrowser({ open, onClose, selectedName, getEntry, onPick, onToast, initialTrackId = null, lockedTag }: ChallengeBrowserProps) {
  // Initial state only: the parent remounts this per open (a `key`), so it opens
  // on the tab and track of whatever the user is working on.
  const [tag, setTag] = useState<Tag>(() => lockedTag ?? (byName.get(selectedName ?? '')?.tag === 'React' ? 'React' : 'JS'));
  const [trackId, setTrackId] = useState<string | null>(initialTrackId);
  const [search, setSearch] = useState('');
  const problems = useChallengeProblems();
  // Read once per open (the component remounts each time it opens).
  const [history] = useState(readHistory);

  const tracks = useMemo(() => challengeTracks.filter((t) => t.tag === tag), [tag]);
  const track = tracks.find((t) => t.id === trackId) ?? null;
  const status = (name: string) => getEntry(name)?.status;
  const solvedIn = (names: string[]) => names.filter((n) => status(n) === 'solved').length;

  const q = search.trim().toLowerCase();
  const names = (track ? track.names : challenges.filter((t) => t.tag === tag).map((t) => t.name))
    .filter((n) => !q || n.toLowerCase().includes(q) || (problems?.[n]?.summary ?? '').toLowerCase().includes(q));

  const pickRandom = () => {
    const pool = (track ? track.names : challenges.filter((t) => t.tag === tag).map((t) => t.name)).filter((n) => status(n) !== 'solved');
    if (!pool.length) { onToast('Everything here is solved 🎉'); return; }
    const t = byName.get(randomItem(pool));
    if (t) onPick(t, track?.id ?? null);
  };
  const startTrack = () => {
    if (!track) return;
    const next = track.names.find((n) => status(n) !== 'solved') ?? track.names[0];
    const t = byName.get(next);
    if (t) onPick(t, track.id);
  };
  const switchTag = (next: Tag) => { setTag(next); setTrackId(null); };

  const inScope = challenges.filter((t) => !lockedTag || t.tag === lockedTag);
  const solvedTotal = solvedIn(inScope.map((t) => t.name));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Challenges"
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="fixed inset-0 m-auto w-[min(1040px,95vw)] h-[min(680px,90vh)] bg-white dark:bg-[#0f0f1a] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[90] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0"><Target size={16} className="text-white" /></div>
                <div className="min-w-0">
                  <h2 className="font-bold text-base leading-tight">Challenges</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{solvedTotal} of {inScope.length} solved · grouped by technique, easiest first</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-[240px]">
                  <Search size={13} className="text-slate-500 dark:text-slate-400 shrink-0" />
                  <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search challenges…" aria-label="Search challenges"
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                </label>
                <button onClick={onClose} aria-label="Close challenges" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><X size={16} /></button>
              </div>
            </div>

            <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-100 dark:border-slate-800" role="group" aria-label="Challenge type">
              {/* The JS and React playgrounds each lock this to their own tag. */}
              {(lockedTag ? [] : (['JS', 'React'] as const)).map((t) => (
                <button key={t} onClick={() => switchTag(t)} aria-pressed={tag === t}
                  className={'px-3 py-1.5 rounded-lg text-xs font-medium ' + (tag === t ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60')}>
                  {t === 'JS' ? 'JavaScript coding' : 'React machine coding'} · {challenges.filter((c) => c.tag === t).length}
                </button>
              ))}
              <button onClick={pickRandom} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                <Shuffle size={12} /> Random unsolved
              </button>
            </div>

            <div className="flex-1 flex min-h-0">
              <TrackList tracks={tracks} activeId={trackId} onSelect={setTrackId} solvedIn={solvedIn} />
              <div className="flex-1 overflow-y-auto">
                {track && (
                  <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-base">{track.title}</h3>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 max-w-2xl">{track.idea}</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{solvedIn(track.names)} of {track.names.length} solved. Work through them in order: each one builds on the last.</p>
                      </div>
                      <button onClick={startTrack} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
                        <Play size={13} /> {solvedIn(track.names) ? 'Continue' : 'Start track'}
                      </button>
                    </div>
                  </div>
                )}
                <ul className="p-3 space-y-0.5">
                  {names.map((n, i) => {
                    const t = byName.get(n);
                    return t ? (
                      <ChallengeRow key={n} t={t} position={track ? i + 1 : null} summary={problems?.[n]?.summary} bestMs={bestSolvedMs(n, history)}
                        status={status(n)} current={n === selectedName} onClick={() => onPick(t, track?.id ?? null)} />
                    ) : null;
                  })}
                  {names.length === 0 && <li className="px-3 py-8 text-sm text-center text-slate-600 dark:text-slate-400">No challenges match “{search}”.</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
