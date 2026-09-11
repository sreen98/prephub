import { Link } from 'react-router-dom';
import { BookOpen, Clock } from 'lucide-react';
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
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
        <BookOpen size={14} />
        Continue Learning
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {guides.map((guide) => {
          const readTime = readMinFor(guide.file);
          const category = menuStructure.find((s) => s.items?.some((i) => i.path === guide.path));
          return (
            <Link
              key={guide.path}
              to={guide.path}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {guide.name}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {category.name}
                  </span>
                )}
                <span className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  ~{readTime}m
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
