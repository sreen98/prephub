// Which heading is the reader currently under? Used by the checkpoint FAB and
// by ContentPage when the user actually saves a checkpoint.
//
// It lives apart from SaveCheckpointFab because a module that exports both a
// component and a plain function breaks Fast Refresh — the react-refresh lint
// rule flags exactly this.

export function findNearestHeadingAbove(threshold: number = 100): { id: string; text: string } | null {
  const headings = document.querySelectorAll<HTMLElement>(
    '.prose-container h1[id], .prose-container h2[id], .prose-container h3[id], .prose-container h4[id]'
  );
  let best: HTMLElement | null = null;
  for (const h of Array.from(headings)) {
    if (h.getBoundingClientRect().top <= threshold) best = h;
    else break;
  }
  if (!best && headings.length) best = headings[0];
  if (!best) return null;
  return { id: best.id, text: best.textContent?.trim().replace(/[#\u00b6\u200b]/g, '').trim() ?? '' };
}
