import React, { useState } from 'react';
import { Timer, Square } from 'lucide-react';
import { INTERVIEW_LENGTHS, formatClock, type UseInterviewModeReturn } from '../../hooks/useInterviewMode';

// The header control for interview mode. Idle: a Start button with the three
// lengths. Running on this challenge: the countdown and End. Running on another
// challenge: a chip that says so, because the timer keeps going.

export default function InterviewControl({ interview, name, isChallenge, onGoTo }: {
  interview: UseInterviewModeReturn;
  name: string | null;
  isChallenge: boolean;
  onGoTo: (name: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const { session, remainingMs, locked } = interview;

  if (session && locked) {
    const low = remainingMs < 5 * 60_000;
    return (
      <span className="flex items-center gap-1.5" role="timer" aria-label={`Interview mode, ${formatClock(remainingMs)} left`}>
        <span className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-mono border ' + (low ? 'border-rose-500/60 text-rose-300 bg-rose-500/10' : 'border-amber-500/50 text-amber-200 bg-amber-500/10')}>
          <Timer size={14} /> {formatClock(remainingMs)}
        </span>
        <button onClick={() => interview.end('ended')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-300 hover:bg-[#2d333b]" title="Stop the timer and unlock Explain and the solution">
          <Square size={12} /> End
        </button>
      </span>
    );
  }
  if (session) {
    return (
      <button onClick={() => onGoTo(session.name)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-amber-500/50 text-amber-200" title="An interview is running on another challenge">
        <Timer size={13} /> {session.name}: {formatClock(remainingMs)}
      </button>
    );
  }
  if (!isChallenge || !name) return null;
  if (picking) {
    return (
      <span className="flex items-center gap-1 p-1 rounded-xl border border-[#3d444d]" role="group" aria-label="Interview length">
        {INTERVIEW_LENGTHS.map((m) => (
          <button key={m} onClick={() => { setPicking(false); interview.start(name, m); }} className="px-2.5 py-1 rounded-lg text-sm text-slate-200 hover:bg-[#2d333b]">{m} min</button>
        ))}
        <button onClick={() => setPicking(false)} className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white">Cancel</button>
      </span>
    );
  }
  return (
    <button onClick={() => setPicking(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-amber-600/50 text-amber-200 hover:bg-amber-500/10" title="Timed attempt: Explain and the solution stay hidden until you finish">
      <Timer size={14} /> Interview
    </button>
  );
}
