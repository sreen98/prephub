import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { menuStructure, loadAllContent } from '../data';
import { cn } from '../lib/cn';

// Command-palette search over every guide's full text.
//
// Extracted from App.tsx to get that file under the 400-line limit. It owns
// its own corpus fetch, which is why it has its own loading state: the corpus
// is every guide's markdown, so a pending download must not read as
// "no results".

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Clearing and focusing is the response to *opening*, not derived state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search needs full text of every guide, which is exactly what we removed
  // from the main bundle. Fetch it the first time the modal opens; the promise
  // is memoised in data.ts so it downloads once per session.
  const [corpus, setCorpus] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (!isOpen || corpus) return;
    let cancelled = false;
    loadAllContent()
      .then((all) => { if (!cancelled) setCorpus(all); })
      .catch((err: unknown) => {
        console.error('[prephub] search corpus failed to load', err);
        if (!cancelled) setCorpus({});   // resolve the loading state; search reports no results
      });
    return () => { cancelled = true; };
  }, [isOpen, corpus]);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const items: { name: string; path: string; file: string; category: string; snippet: string; nameMatch: boolean }[] = [];

    for (const section of menuStructure) {
      if (!section.items) continue;
      for (const item of section.items) {
        const nameMatch = item.name.toLowerCase().includes(q);
        const content = corpus?.[item.file] || '';
        const contentMatch = content.toLowerCase().includes(q);

        if (nameMatch || contentMatch) {
          let snippet = '';
          if (contentMatch) {
            const idx = content.toLowerCase().indexOf(q);
            const start = Math.max(0, idx - 60);
            const end = Math.min(content.length, idx + query.length + 60);
            snippet = (start > 0 ? '...' : '') + content.slice(start, end).replace(/\n/g, ' ').trim() + (end < content.length ? '...' : '');
          }
          items.push({ ...item, category: section.name, snippet, nameMatch });
        }
      }
    }
    return items.sort((a, b) => (b.nameMatch ? 1 : 0) - (a.nameMatch ? 1 : 0)).slice(0, 10);
  }, [query, corpus]);

  const handleSelect = (path: string) => {
    const url = query.trim().length >= 2 ? `${path}?q=${encodeURIComponent(query.trim())}` : path;
    navigate(url);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[201] px-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <Search size={18} className="text-slate-500 dark:text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') onClose();
                    if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].path);
                  }}
                  placeholder="Search guides and content..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                  ESC
                </kbd>
              </div>

              {query.length >= 2 && (
                <div className="max-h-[50vh] overflow-y-auto p-2">
                  {!corpus ? (
                    /* The search corpus is fetched on first open (content is
                       lazy-loaded), so distinguish "still loading" from
                       "genuinely nothing matched" — otherwise every first
                       search reads as a miss. */
                    <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-indigo-500 animate-spin" />
                      Loading search index…
                    </div>
                  ) : results.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No results found for &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    results.map((item, i) => (
                      <button
                        key={item.path}
                        onClick={() => handleSelect(item.path)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl transition-colors",
                          "hover:bg-slate-100 dark:hover:bg-slate-800",
                          i === 0 && "bg-slate-50 dark:bg-slate-800/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        {item.snippet && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.snippet}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {query.length < 2 && (
                <div className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
                  Type to search across all {menuStructure.flatMap(s => s.items || []).length} guides...
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ==================== Official Docs Bar ====================


// ==================== Content Page ====================


// ==================== Save Checkpoint FAB ====================

// Finds the heading whose top is just above (or at) the given threshold from
// the viewport top. Falls back to the first heading if the user is at the very
// top of the page. Returns null only when the guide has no headings at all.


// ==================== Back to Top ====================

export default SearchModal;
