import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, BookOpen, ChevronRight, Shuffle, Braces } from 'lucide-react';
import type { Difficulty, Pattern } from '../../data/playground/playgroundTemplates';
import {
  ALL_PATTERNS, PATTERN_GROUPS, allTemplates, blankStarters,
  type CategoryMeta, type TemplateMeta,
} from '../../data/playground/templateIndex';
import type { UseTemplateFiltersReturn } from '../../hooks/useTemplateFilters';
import BlankStarterList from './BlankStarterList';
import TemplateFilterSidebar from './TemplateFilterSidebar';
import TemplateGrid from './TemplateGrid';
import type { ProgressEntry } from '../../hooks/usePlaygroundProgress';
import type { TemplateLang } from '../../data/playground/playgroundTemplates';

// The template picker. Extracted from CodePlayground, where it was 453 of the
// component's ~1,400 lines.
//
// All six filter dimensions arrive as one `filters` object rather than twelve
// separate props — that object is the useTemplateFilters reducer, and keeping
// it whole is what guarantees a tag or mode change clears pattern/difficulty
// as a single transition (the "No templates found" bug).

export interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  filters: UseTemplateFiltersReturn;
  searchRef: React.RefObject<HTMLInputElement | null>;
  categories: CategoryMeta[];
  tagOptions: string[];
  difficultyCounts: Record<Difficulty, number>;
  patternCounts: Record<Pattern, number>;
  scopeHasPatterns: boolean;
  scopeHasDifficulty: boolean;
  selectedName: string | null;
  getEntry: (name: string) => ProgressEntry | null;
  onPickTemplate: (t: TemplateMeta) => void;
  onPickBlank: (s: { name: string; lang: TemplateLang; code: string }) => void;
  onToast: (message: string) => void;
}

export default function TemplateModal({
  open, onClose, filters, searchRef, categories, tagOptions,
  difficultyCounts, patternCounts, scopeHasPatterns, scopeHasDifficulty,
  selectedName, getEntry, onPickTemplate, onPickBlank, onToast,
}: TemplateModalProps) {
  // The shell only needs the search box, the mode tabs and the footer counts;
  // the two panes take the whole `filters` object and destructure what they
  // need themselves.
  const { search: drawerSearch, mode: modalMode, setSearch: setDrawerSearch, setMode: setModalMode } = filters;

  const isDrawerOpen = open;
  const closeDrawer = onClose;
  const drawerSearchRef = searchRef;
  const setToastMsg = onToast;

  return (
    <>
        {/* Templates Modal -- 2-pane layout: categories on the left, snippets on the right */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                onClick={closeDrawer}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="fixed inset-0 m-auto w-[min(960px,94vw)] h-[min(620px,88vh)] bg-white dark:bg-[#0f0f1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[90] flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <BookOpen size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base leading-tight">
                        {modalMode === 'templates' ? 'Templates' : modalMode === 'challenges' ? 'Coding Challenges' : 'Blank Starters'}
                      </h2>
                      <span className="text-[11px] text-slate-400">
                        {modalMode === 'blank'
                          ? 'Start fresh in JS, TS, or React'
                          : modalMode === 'challenges'
                            ? `${allTemplates.filter(t => t.kind === 'challenge').length} challenges to solve`
                            : `${allTemplates.filter(t => t.kind === 'template').length} reference snippets`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-[260px]">
                      <Search size={13} className="text-slate-400 shrink-0" />
                      <input
                        ref={drawerSearchRef}
                        value={drawerSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDrawerSearch(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Escape' && closeDrawer()}
                        placeholder="Search templates..."
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
                      />
                      {drawerSearch && (
                        <button onClick={() => { setDrawerSearch(''); drawerSearchRef.current?.focus(); }} aria-label="Clear search" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={closeDrawer}
                      aria-label="Close template picker"
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Mode toggle: Templates / Challenges / Blank */}
                <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20">
                  {([
                    { id: 'templates' as const,  label: 'Templates',   count: allTemplates.filter(t => t.kind === 'template').length },
                    { id: 'challenges' as const, label: 'Challenges',  count: allTemplates.filter(t => t.kind === 'challenge').length },
                    { id: 'blank' as const,      label: 'Blank',       count: blankStarters.length },
                  ]).map(({ id, label, count }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setModalMode(id);   // reducer resets pattern + difficulty
                      }}
                      className={
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' +
                        (modalMode === id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:text-slate-400')
                      }
                    >
                      {label}
                      <span className={
                        'text-[10px] px-1.5 py-0.5 rounded-md ' +
                        (modalMode === id
                          ? 'bg-indigo-100 dark:bg-indigo-900/60'
                          : 'bg-slate-100 dark:bg-slate-800')
                      }>
                        {count}
                      </span>
                    </button>
                  ))}
                  {modalMode === 'challenges' && (
                    <button
                      onClick={() => {
                        const candidates = allTemplates.filter(t =>
                          t.kind === 'challenge' && t.tag === 'JS' && getEntry(t.name)?.status !== 'solved'
                        );
                        if (candidates.length === 0) {
                          setToastMsg('All challenges solved 🎉');
                          return;
                        }
                        const pick = candidates[Math.floor(Math.random() * candidates.length)];
                        onPickTemplate(pick);
                      }}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      title="Open a random unsolved challenge"
                    >
                      <Shuffle size={12} />
                      Random
                    </button>
                  )}
                </div>


                {/* Body — Blank mode shows starter cards; otherwise the 2-pane layout */}
                {/* Body — Blank mode shows starter cards; otherwise the 2-pane layout */}
                {modalMode === 'blank' ? (
                  <BlankStarterList onPick={onPickBlank} />
                ) : (
                <div className="flex-1 flex min-h-0">
                  <TemplateFilterSidebar
                    filters={filters}
                    categories={categories}
                    tagOptions={tagOptions}
                    patternCounts={patternCounts}
                    scopeHasPatterns={scopeHasPatterns}
                  />
                  <TemplateGrid
                    filters={filters}
                    categories={categories}
                    difficultyCounts={difficultyCounts}
                    scopeHasDifficulty={scopeHasDifficulty}
                    selectedName={selectedName}
                    getEntry={getEntry}
                    onPickTemplate={onPickTemplate}
                  />
                </div>
                )}

                {/* Modal Footer */}
                <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    {modalMode === 'blank'
                      ? `${blankStarters.length} starters`
                      : `${categories.reduce((n, c) => n + c.templates.length, 0)} matching`}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono mx-0.5">Esc</kbd> to close
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </>
  );
}
