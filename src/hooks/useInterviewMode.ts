import { useCallback, useEffect, useState } from 'react';
import { getJSON, setJSON, safeRemove } from '../lib/storage';

/**
 * Interview mode: one challenge, a countdown, and no Explain / Show Solution /
 * Compare until it ends. Reading an answer and practising producing one are
 * different activities, and the playground only supported the first.
 *
 * The session is stored, so a reload does not reset the clock (that would make
 * the timer trivially escapable), and every attempt is kept so the Challenges
 * list can show a best time.
 */
const ACTIVE_KEY = 'playground-interview-active';
const HISTORY_KEY = 'playground-interview-history';

export interface InterviewSession { name: string; startedAt: number; minutes: number }
export type InterviewOutcome = 'solved' | 'timeout' | 'ended';
export interface InterviewAttempt { startedAt: number; minutes: number; elapsedMs: number; outcome: InterviewOutcome }

export const INTERVIEW_LENGTHS = [15, 30, 45] as const;

function isSession(v: unknown): v is InterviewSession {
  return !!v && typeof v === 'object' && typeof (v as InterviewSession).name === 'string'
    && typeof (v as InterviewSession).startedAt === 'number' && typeof (v as InterviewSession).minutes === 'number';
}

export function readHistory(): Record<string, InterviewAttempt[]> {
  const h = getJSON<Record<string, InterviewAttempt[]>>(HISTORY_KEY, {});
  return h && typeof h === 'object' ? h : {};
}

/** Fastest solved attempt for a challenge, in ms, or null. */
export function bestSolvedMs(name: string, history = readHistory()): number | null {
  const solved = (history[name] ?? []).filter((a) => a.outcome === 'solved').map((a) => a.elapsedMs);
  return solved.length ? Math.min(...solved) : null;
}

export function formatClock(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Pure: the attempt a session produces when it ends at `now`. */
export function attemptFor(session: InterviewSession, outcome: InterviewOutcome, now: number): InterviewAttempt {
  const limit = session.minutes * 60_000;
  return { startedAt: session.startedAt, minutes: session.minutes, elapsedMs: Math.min(now - session.startedAt, limit), outcome };
}

export interface UseInterviewModeReturn {
  session: InterviewSession | null;
  /** ms left, or 0 when no session. */
  remainingMs: number;
  /** True while a session runs on THIS template: Explain / Solution / Compare are hidden. */
  locked: boolean;
  start: (name: string, minutes: number) => void;
  end: (outcome: InterviewOutcome) => InterviewAttempt | null;
  /** Call after a graded run; ends the session as solved when it was this template. */
  reportSolved: (name: string) => InterviewAttempt | null;
  lastAttempt: InterviewAttempt | null;
}

export function useInterviewMode(currentName: string | null, onTimeUp: (a: InterviewAttempt) => void): UseInterviewModeReturn {
  const [session, setSession] = useState<InterviewSession | null>(() => {
    const s = getJSON<unknown>(ACTIVE_KEY, null);
    return isSession(s) ? s : null;
  });
  const [now, setNow] = useState(() => Date.now());
  const [lastAttempt, setLastAttempt] = useState<InterviewAttempt | null>(null);

  const finish = useCallback((s: InterviewSession, outcome: InterviewOutcome): InterviewAttempt => {
    const attempt = attemptFor(s, outcome, Date.now());
    const history = readHistory();
    setJSON(HISTORY_KEY, { ...history, [s.name]: [...(history[s.name] ?? []), attempt] });
    safeRemove(ACTIVE_KEY);
    setSession(null);
    setLastAttempt(attempt);
    return attempt;
  }, []);

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t - session.startedAt >= session.minutes * 60_000) onTimeUp(finish(session, 'timeout'));
    }, 1000);
    return () => window.clearInterval(id);
  }, [session, finish, onTimeUp]);

  const start = useCallback((name: string, minutes: number) => {
    const s = { name, startedAt: Date.now(), minutes };
    setJSON(ACTIVE_KEY, s);
    setNow(s.startedAt);
    setLastAttempt(null);
    setSession(s);
  }, []);

  const end = useCallback((outcome: InterviewOutcome) => (session ? finish(session, outcome) : null), [session, finish]);
  const reportSolved = useCallback((name: string) => (session && session.name === name ? finish(session, 'solved') : null), [session, finish]);

  const remainingMs = session ? Math.max(0, session.startedAt + session.minutes * 60_000 - now) : 0;
  return { session, remainingMs, locked: !!session && session.name === currentName, start, end, reportSolved, lastAttempt };
}
