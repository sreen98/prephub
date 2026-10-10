import { describe, it, expect } from 'vitest';
import { formatReadTime } from './formatReadTime';

describe('formatReadTime', () => {
  it.each([
    [0, '1 min'],
    [0.4, '1 min'],
    [12, '12 min'],
    [59, '59 min'],
    [60, '1 h'],
    [96, '1.5 h'],          // 1.6 h rounds to the nearest half hour
    [105, '2 h'],           // 1.75 h
    [610, '10 h'],          // from ten hours, whole hours only
    [2499, '42 h'],         // the Front End total that used to read "2499m"
    [Number.NaN, '1 min'],
  ])('%s minutes reads as %s', (minutes, expected) => {
    expect(formatReadTime(minutes)).toBe(expected);
  });
});
