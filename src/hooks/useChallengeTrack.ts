import { useCallback, useMemo, useState } from 'react';
import { findTrack, type ChallengeTrack } from '../data/playground/challengeTracks';

export interface ActiveTrack {
  track: ChallengeTrack;
  /** 0-based position of the open challenge in the track. */
  index: number;
  prev: string | null;
  next: string | null;
}

/**
 * Which study track the user is working through, if any. The track is only
 * "active" while the open challenge belongs to it: opening an unrelated template
 * leaves the track without clearing it, and coming back resumes it. Derived during
 * render, so there is no effect keeping two pieces of state in sync.
 */
export function useChallengeTrack(selectedName: string | null) {
  const [trackId, setTrackId] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);

  const active = useMemo((): ActiveTrack | null => {
    const track = findTrack(trackId);
    if (!track || !selectedName) return null;
    const index = track.names.indexOf(selectedName);
    if (index < 0) return null;
    return {
      track,
      index,
      prev: index > 0 ? track.names[index - 1] : null,
      next: index < track.names.length - 1 ? track.names[index + 1] : null,
    };
  }, [trackId, selectedName]);

  const openBrowser = useCallback(() => setBrowserOpen(true), []);
  const closeBrowser = useCallback(() => setBrowserOpen(false), []);

  return { active, setTrackId, browserOpen, openBrowser, closeBrowser };
}
