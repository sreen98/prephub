// Placeholder shown in place of a guide's body while its markdown chunk loads.

export const GuideSkeleton = () => (
  <div className="animate-pulse" aria-busy="true" aria-label="Loading guide">
    <div className="h-9 w-3/4 rounded-lg bg-ink/10 mb-6" />
    <div className="space-y-3 mb-8">
      <div className="h-3.5 w-full rounded bg-ink/10" />
      <div className="h-3.5 w-11/12 rounded bg-ink/10" />
      <div className="h-3.5 w-9/12 rounded bg-ink/10" />
    </div>
    <div className="h-6 w-1/3 rounded bg-ink/10 mb-4" />
    <div className="h-28 w-full rounded-lg bg-ink/10 mb-8" />
    <div className="space-y-3">
      <div className="h-3.5 w-full rounded bg-ink/10" />
      <div className="h-3.5 w-10/12 rounded bg-ink/10" />
      <div className="h-3.5 w-11/12 rounded bg-ink/10" />
    </div>
  </div>
);

export default GuideSkeleton;
