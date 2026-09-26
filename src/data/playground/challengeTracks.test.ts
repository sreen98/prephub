import { describe, it, expect } from 'vitest';
import { challengeTracks, PATTERN_IDEAS } from './challengeTracks';
import { allTemplates } from './templateIndex';

const challenges = allTemplates.filter((t) => t.kind === 'challenge');
const jsNames = new Set(challenges.filter((t) => t.tag === 'JS').map((t) => t.name));
const reactNames = challenges.filter((t) => t.tag === 'React').map((t) => t.name);

describe('challenge study tracks', () => {
  it('every track name is a real challenge of the right kind', () => {
    for (const track of challengeTracks) {
      for (const name of track.names) {
        const t = challenges.find((c) => c.name === name);
        expect(t, `${track.title}: "${name}" is not a challenge`).toBeTruthy();
        expect(t!.tag, `${track.title}: "${name}"`).toBe(track.tag);
      }
    }
  });

  it('every JS challenge is in at least one track, via its patterns', () => {
    const inTracks = new Set(challengeTracks.filter((t) => t.tag === 'JS').flatMap((t) => t.names));
    expect([...jsNames].filter((n) => !inTracks.has(n))).toEqual([]);
  });

  it('TypeScript challenges have their own track and appear in no other', () => {
    const tsNames = challenges.filter((t) => t.tag === 'JS' && t.lang === 'ts').map((t) => t.name);
    expect(tsNames.length).toBeGreaterThan(0);
    const own = challengeTracks.find((t) => t.id === 'js-typescript-types');
    expect(own?.names.slice().sort()).toEqual([...tsNames].sort());
    const elsewhere = challengeTracks.filter((t) => t !== own).flatMap((t) => t.names).filter((n) => tsNames.includes(n));
    expect(elsewhere).toEqual([]);
  });

  it('every React challenge is in exactly one theme track', () => {
    const listed = challengeTracks.filter((t) => t.tag === 'React').flatMap((t) => t.names);
    expect(reactNames.filter((n) => !listed.includes(n)), 'missing from every React track').toEqual([]);
    expect(listed.filter((n, i) => listed.indexOf(n) !== i), 'listed twice').toEqual([]);
  });

  it('JS tracks run Easy before Medium before Hard', () => {
    const rank = { Easy: 1, Medium: 2, Hard: 3 } as const;
    for (const track of challengeTracks.filter((t) => t.tag === 'JS')) {
      const ranks = track.names.map((n) => rank[challenges.find((c) => c.name === n)!.difficulty ?? 'Medium']);
      expect(ranks, track.title).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it('every pattern has a plain-words idea, and track ids are unique', () => {
    for (const idea of Object.values(PATTERN_IDEAS)) expect(idea.length).toBeGreaterThan(40);
    const ids = challengeTracks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
