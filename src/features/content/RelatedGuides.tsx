import { Link } from 'react-router-dom';
import { readMinFor, menuStructure } from '../../data';
import type { MenuItem } from '../../data';

// The "Continue Learning" strip under a guide. Extracted from ContentPage's
// render, which was over the 300-line function limit — this was a complete,
// self-contained block with no dependency on the page's state.
//
// Note it uses readMinFor(), not estimateReadingTime(): these guides have not
// been downloaded, and estimating from content would pull every one of them
// into the bundle.

export default function RelatedGuides({ guides }: { guides: MenuItem[] }) {
  if (guides.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-line">
      <h3 className="font-display text-2xl font-semibold text-ink mb-5">Continue learning</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {guides.map((guide) => {
          const readTime = readMinFor(guide.file);
          const category = menuStructure.find((s) => s.items?.some((i) => i.path === guide.path));
          return (
            <Link
              key={guide.path}
              to={guide.path}
              className="group index-card block px-4 pt-3 pb-4 hover:border-ink/30 transition-colors"
            >
              <div className="index-card-head pb-2 mb-2 font-display text-lg font-semibold leading-snug text-ink group-hover:text-accent transition-colors">
                {guide.name}
              </div>
              <div className="font-mono text-xs text-muted">
                {category ? `${category.name} · ` : ''}~{readTime} min
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
