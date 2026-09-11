import { Braces } from 'lucide-react';
import type { Difficulty, Pattern } from '../../data/playground/playgroundTemplates';
import {
  ALL_PATTERNS, PATTERN_GROUPS, allTemplates,
  type CategoryMeta,
} from '../../data/playground/templateIndex';
import type { UseTemplateFiltersReturn } from '../../hooks/useTemplateFilters';

// Left pane of the template picker. In challenges mode it lists algorithmic
// PATTERNS grouped into super-categories; otherwise it lists template
// categories. Counts are scoped to the active tag so the numbers match the
// list on the right rather than always showing the JavaScript totals.

export default function TemplateFilterSidebar({
  filters, categories, tagOptions, patternCounts, scopeHasPatterns,
}: {
  filters: UseTemplateFiltersReturn;
  categories: CategoryMeta[];
  tagOptions: string[];
  patternCounts: Record<Pattern, number>;
  difficultyCounts?: Record<Difficulty, number>;
  scopeHasPatterns: boolean;
}) {
  const {
    search: drawerSearch, tag: drawerFilter, category: activeCategory,
    mode: modalMode, pattern: patternFilter,
    setTag: setDrawerFilter, setCategory: setActiveCategory, setPattern: setPatternFilter,
  } = filters;
  const filteredCategories = categories;
  return (
    <div className="w-[220px] shrink-0 border-r border-slate-100 dark:border-slate-800 py-3 overflow-y-auto sidebar-scroll bg-slate-50/60 dark:bg-slate-900/40">
      {/* Tag pills at top of category list — counts respect the
          current modal mode (templates vs challenges) so they
          reflect what the user is actually browsing. */}
      <div className="px-3 pb-3 flex gap-1.5 flex-wrap">
        {tagOptions.map((tag: string) => {
          const wantedKind = modalMode === 'challenges' ? 'challenge' : 'template';
          const inMode = allTemplates.filter(t => (t.kind ?? 'template') === wantedKind);
          const count: number = tag === 'all' ? inMode.length : inMode.filter(t => t.tag.toLowerCase() === tag).length;
          return (
            <button
              key={tag}
              onClick={() => {
                setDrawerFilter(tag);   // reducer resets pattern + difficulty
              }}
              className={[
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize flex items-center gap-1",
                drawerFilter === tag
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  : "bg-white dark:bg-slate-800/70 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              ].join(' ')}
            >
              {tag === 'all' ? 'All' : tag}
              <span className="text-[9px] opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="px-2">
        {/* In challenges mode, the sidebar lists PATTERNS grouped
            by super-category. In templates/blank mode, it lists
            CATEGORIES (the original behavior). */}
        {modalMode === 'challenges' && scopeHasPatterns ? (
          <>
            <button
              onClick={() => setPatternFilter('all')}
              className={[
                "w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between",
                patternFilter === 'all'
                  ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                {patternFilter === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                <span>All patterns</span>
              </span>
              <span className="text-[10px] text-slate-400">{
                // Total challenges in the current view (after drawerFilter+search)
                // ignoring patternFilter — the count when "All" is selected.
                allTemplates.filter(t => {
                  if (t.kind !== 'challenge') return false;
                  if (drawerFilter !== 'all' && t.tag.toLowerCase() !== drawerFilter) return false;
                  if (drawerSearch && !t.name.toLowerCase().includes(drawerSearch.toLowerCase())) return false;
                  return true;
                }).length
              }</span>
            </button>
            {PATTERN_GROUPS.map(group => {
              const visible = group.patterns.filter(p => patternCounts[p] > 0);
              if (visible.length === 0) return null;
              return (
                <div key={group.label} className="mt-3">
                  <div className="px-3 mb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                    {group.label}
                  </div>
                  {visible.map(p => {
                    const isActive = patternFilter === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPatternFilter(isActive ? 'all' : p)}
                        className={[
                          "w-full text-left px-3 py-1.5 mt-0.5 rounded-lg text-[12.5px] transition-colors flex items-center justify-between gap-2",
                          isActive
                            ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
                        ].join(' ')}
                        title={`${patternCounts[p]} challenge${patternCounts[p] === 1 ? '' : 's'} use this pattern`}
                      >
                        <span className="truncate flex items-center gap-2">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                          {p}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{patternCounts[p]}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveCategory('all')}
              className={[
                "w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between",
                activeCategory === 'all'
                  ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
              ].join(' ')}
            >
              <span>All categories</span>
              <span className="text-[10px] text-slate-400">{filteredCategories.reduce((n, c) => n + c.templates.length, 0)}</span>
            </button>
            {filteredCategories.map((cat: CategoryMeta) => {
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={[
                    "w-full text-left px-3 py-2 mt-0.5 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2",
                    isActive
                      ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
                  ].join(' ')}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={[
                      "text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                      cat.tag === 'React' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        cat.tag === 'Polyfills' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    ].join(' ')}>
                      {cat.tag}
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{cat.templates.length}</span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
