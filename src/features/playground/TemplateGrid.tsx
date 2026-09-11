import { Search, Shuffle, ChevronRight } from 'lucide-react';
import type { Difficulty, Pattern } from '../../data/playground/playgroundTemplates';
import type { CategoryMeta, TemplateMeta } from '../../data/playground/templateIndex';
import type { UseTemplateFiltersReturn } from '../../hooks/useTemplateFilters';
import type { ProgressEntry } from '../../hooks/usePlaygroundProgress';

// Right pane of the template picker: the cards, the difficulty chips, the
// mobile search box and the "Random challenge" action. Status dots come from
// saved progress — green for solved, amber for in-progress.

export default function TemplateGrid({
  filters, categories, difficultyCounts, scopeHasDifficulty,
  selectedName, getEntry, onPickTemplate,
}: {
  filters: UseTemplateFiltersReturn;
  categories: CategoryMeta[];
  difficultyCounts: Record<Difficulty, number>;
  patternCounts?: Record<Pattern, number>;
  scopeHasDifficulty: boolean;
  selectedName: string | null;
  getEntry: (name: string) => ProgressEntry | null;
  onPickTemplate: (t: TemplateMeta) => void;
}) {
  const {
    search: drawerSearch, category: activeCategory,
    mode: modalMode, difficulty: difficultyFilter,
    setSearch: setDrawerSearch, setDifficulty: setDifficultyFilter,
  } = filters;
  const filteredCategories = categories;
  const handleTemplate = onPickTemplate;
  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll p-4">
      {/* Mobile-only search */}
      <div className="sm:hidden mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <Search size={13} className="text-slate-400 shrink-0" />
        <input
          value={drawerSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDrawerSearch(e.target.value)}
          placeholder="Search templates..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {/* Difficulty filter chips — only in challenges mode. */}
      {modalMode === 'challenges' && scopeHasDifficulty && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Difficulty:</span>
          {(['all', 'Easy', 'Medium', 'Hard'] as const).map(d => {
            const isActive = difficultyFilter === d;
            const count = d === 'all'
              ? difficultyCounts.Easy + difficultyCounts.Medium + difficultyCounts.Hard
              : difficultyCounts[d];
            const tone = d === 'Easy'
              ? (isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40')
              : d === 'Medium'
              ? (isActive ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40')
              : d === 'Hard'
              ? (isActive ? 'bg-red-600 text-white' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40')
              : (isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700');
            return (
              <button
                key={d}
                onClick={() => setDifficultyFilter(isActive && d !== 'all' ? 'all' : d)}
                className={
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ' + tone
                }
              >
                {d === 'all' ? 'All' : d}
                <span className={'text-[9px] px-1 rounded ' + (isActive ? 'bg-white/20' : 'bg-white/40 dark:bg-slate-900/40')}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filteredCategories.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
          <Search size={32} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No templates found</p>
          <p className="text-xs mt-1">Try a different search or filter</p>
        </div>
      ) : (
        (activeCategory === 'all' ? filteredCategories : filteredCategories.filter(c => c.label === activeCategory)).map((cat: CategoryMeta) => (
          <div key={cat.label} className="mb-5 last:mb-0">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {cat.label}
              </span>
              <span className={[
                "text-[9px] px-1.5 py-0.5 rounded-full font-semibold",
                cat.tag === 'React' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  cat.tag === 'Polyfills' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              ].join(' ')}>
                {cat.tag}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.templates.map((t: TemplateMeta) => {
                const isActive: boolean = selectedName === t.name;
                const entry = getEntry(t.name);
                const dotCls = entry?.status === 'solved'
                  ? 'bg-emerald-500'
                  : entry
                  ? 'bg-amber-400'
                  : '';
                return (
                  <button
                    key={t.name}
                    onClick={() => handleTemplate(t)}
                    className={[
                      "text-left px-3 py-2.5 rounded-xl text-[13px] transition-all flex items-center gap-2 group border",
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300"
                    ].join(' ')}
                    title={
                      entry?.status === 'solved' ? 'Solved'
                      : entry ? 'In progress'
                      : undefined
                    }
                  >
                    {dotCls && <span className={`w-2 h-2 rounded-full shrink-0 ${dotCls}`} aria-hidden />}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="truncate">{t.name}</span>
                      {(t.patterns?.length || t.difficulty) && (
                        <div className="flex flex-wrap gap-0.5 items-center">
                          {t.difficulty && (
                            <span
                              className={
                                'text-[9px] px-1 py-0 rounded font-semibold leading-tight ' +
                                (t.difficulty === 'Easy'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : t.difficulty === 'Medium'
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400')
                              }
                              title={`Difficulty: ${t.difficulty}`}
                            >
                              {t.difficulty}
                            </span>
                          )}
                          {t.patterns?.map((p: Pattern) => (
                            <span
                              key={p}
                              className="text-[9px] px-1 py-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 leading-tight"
                              title={`Pattern: ${p}`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {t.jsx && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 shrink-0">
                        JSX
                      </span>
                    )}
                    <ChevronRight size={12} className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
