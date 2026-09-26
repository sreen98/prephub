import { describe, it, expect } from 'vitest';
import { attemptFor, bestSolvedMs, formatClock } from './useInterviewMode';

describe('interview mode', () => {
  it('an attempt never records more time than the limit', () => {
    const s = { name: 'Two Sum', startedAt: 0, minutes: 15 };
    expect(attemptFor(s, 'solved', 5 * 60_000).elapsedMs).toBe(5 * 60_000);
    expect(attemptFor(s, 'timeout', 99 * 60_000).elapsedMs).toBe(15 * 60_000);
  });

  it('best time counts solved attempts only', () => {
    const history = { 'Two Sum': [
      { startedAt: 0, minutes: 15, elapsedMs: 60_000, outcome: 'timeout' as const },
      { startedAt: 1, minutes: 15, elapsedMs: 300_000, outcome: 'solved' as const },
      { startedAt: 2, minutes: 15, elapsedMs: 200_000, outcome: 'solved' as const },
    ] };
    expect(bestSolvedMs('Two Sum', history)).toBe(200_000);
    expect(bestSolvedMs('Other', history)).toBeNull();
  });

  it('formats a clock', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(61_000)).toBe('1:01');
    expect(formatClock(45 * 60_000)).toBe('45:00');
  });
});
