import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark-dimmed.min.css';
import {
  Menu, X, Sun, Moon, ChevronDown, BookOpen,
  Monitor, Braces, Server, Layers, Search, Sparkles,
  Copy, Check, ArrowUp, Play, Zap, Terminal, List,
  PanelLeftClose, PanelLeftOpen, ExternalLink, Type, Clock,
  Link2, Bookmark, BookmarkCheck, Flame, GraduationCap,
  RotateCcw, FileText, CheckCircle, Circle,
  ScrollText, Lock, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from './hooks/useDarkMode';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MenuSection, MenuItem } from './data';
import { contentFiles, menuStructure, slugify, getTextContent, extractHeadings, escapeRegex, estimateReadingTime, cheatSheets, getAllQuestions } from './data';
import { useReadingPrefs } from './hooks/useReadingPrefs';
import { useProgress } from './hooks/useProgress';
import { useBookmarks } from './hooks/useBookmarks';
import { useCheckpoints } from './hooks/useCheckpoints';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { useStudyStats } from './hooks/useStudyStats';
import MermaidBlock from './components/MermaidBlock';
import StreakCelebration from './components/StreakCelebration';
import Toast from './components/Toast';

// Route-level code splitting. Each gets its own bundle chunk so users on
// other routes don't pay for code they aren't using.
const HomePage           = lazy(() => import('./components/HomePage'));
const QuizMode           = lazy(() => import('./components/QuizMode'));
const CodePlayground     = lazy(() => import('./components/CodePlayground'));
const BookmarksPage      = lazy(() => import('./components/BookmarksPage'));
const CheckpointsPage    = lazy(() => import('./components/CheckpointsPage'));
const ReviewPage         = lazy(() => import('./components/ReviewPage'));
const InterviewSimulator = lazy(() => import('./components/InterviewSimulator'));
const CheatSheetsIndex   = lazy(() => import('./components/CheatSheetsIndex'));
const AdminPage          = lazy(() => import('./components/AdminPage'));

// Loader shown while a lazy route chunk is being fetched.
// Pulse-skeleton hints at the upcoming page shape so the transition
// feels quieter than a spinner pop-in.
const RouteFallback = () => (
  <div className="px-6 py-12 md:px-12 max-w-5xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading page">
    <div className="h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800 mb-4" />
    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800 mb-10" />
    <div className="space-y-3">
      <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-10/12 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-9/12 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="mt-8 flex items-center gap-3 text-slate-400">
      <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-indigo-500 animate-spin" />
      <span className="text-xs font-medium">Loading…</span>
    </div>
  </div>
);

const GithubIcon = ({ size = 16, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

// Strip the markdown "## Table of Contents" section (the app generates its own TOC)
function stripMarkdownToc(md: string): string {
  return md.replace(/^## Table of Contents\n[\s\S]*?(?=\n---\s*\n|\n## )/m, '');
}

// ==================== Reading Progress ====================

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress < 1) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// ==================== Code Block ====================

const PreBlock = ({ children }: { children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLPreElement>(null);
  const navigate = useNavigate();

  let language = '';
  React.Children.forEach(children, child => {
    if (React.isValidElement<{ className?: string }>(child)) {
      const match = /language-(\w+)/.exec(child.props?.className || '');
      if (match) language = match[1];
    }
  });

  const isRunnable = ['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx'].includes(language);

  const handleCopy = async () => {
    const text = ref.current?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may not be available */ }
  };

  const handleTryIt = () => {
    let text = ref.current?.textContent || '';
    // Detect JSX broadly: capitalized tag (`<Timer />`), any JSX returned from a function
    // (`return <button>`), React hook usage, or an explicit render call.
    const hasJSX =
      /<[A-Z][A-Za-z0-9]*/.test(text) ||
      /return\s*\(?\s*<[a-zA-Z]/.test(text) ||
      /\b(useState|useEffect|useRef|useMemo|useCallback|useReducer|useContext|useLayoutEffect)\s*\(/.test(text);
    // `render\s*\(` would also match a class method declaration `render() {`.
    // Require a JSX argument: `render(<` so we only count actual top-level calls.
    const hasRender = /(?:^|\n|;)\s*render\s*\(\s*</.test(text) || /ReactDOM\.(render|createRoot)/.test(text);
    if (hasJSX && !hasRender) {
      const matches = [
        ...text.matchAll(/function\s+([A-Z][A-Za-z0-9]*)\s*\(/g),
        ...text.matchAll(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=/g),
        ...text.matchAll(/class\s+([A-Z][A-Za-z0-9]*)\s+extends/g),
      ];
      if (matches.length > 0) {
        const componentName = matches[matches.length - 1][1];
        text = `${text.replace(/\s+$/, '')}\n\nrender(<${componentName} />);`;
      }
    }
    sessionStorage.setItem('playground-code', text);
    window.open(`${import.meta.env.BASE_URL}playground`, '_blank');
  };

  return (
    <div className="code-block group">
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <div className="flex items-center gap-2">
          {isRunnable && (
            <button onClick={handleTryIt} className="try-btn">
              <Play size={12} /><span>Try it</span>
            </button>
          )}
          <button onClick={handleCopy} className="copy-btn">
            {copied
              ? <><Check size={12} /><span>Copied!</span></>
              : <><Copy size={12} /><span>Copy</span></>
            }
          </button>
        </div>
      </div>
      <pre ref={ref} className="code-block-body">
        {children}
      </pre>
    </div>
  );
};

// ==================== Table of Contents ====================

const TableOfContents = ({ content, isCollapsed, onToggle }: { content: string; isCollapsed: boolean; onToggle: () => void }) => {
  const [activeId, setActiveId] = useState('');

  const headings = useMemo(() => {
    return extractHeadings(content).filter(h => h.level >= 2 && h.level <= 3);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -75% 0px' }
    );

    const timer = setTimeout(() => {
      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length < 4) return null;

  // Expand tab when collapsed
  if (isCollapsed) {
    return (
      <button
        onClick={onToggle}
        className="hidden xl:flex fixed top-1/2 -translate-y-1/2 right-0 z-[55] py-3 px-1 rounded-l-lg bg-slate-200/80 dark:bg-slate-800/80 border border-r-0 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 hover:px-2 transition-all"
        title="Show table of contents"
      >
        <PanelLeftOpen size={14} className="text-slate-500 dark:text-slate-400 rotate-180" />
      </button>
    );
  }

  return (
    <aside className="hidden xl:block w-60 fixed top-0 right-0 h-screen overflow-y-auto pt-8 pb-8 pl-5 pr-4 sidebar-scroll bg-slate-50 dark:bg-[#0a0a0f] border-l border-slate-200/50 dark:border-slate-800/50">
      <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            On this page
          </h4>
          <button onClick={onToggle} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" title="Hide table of contents">
            <PanelLeftClose size={12} className="text-slate-400 rotate-180" />
          </button>
        </div>
        <nav className="space-y-0.5">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => {
                const el = document.getElementById(heading.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={cn(
                "block w-full text-left text-[12px] leading-snug py-1.5 transition-colors truncate",
                heading.level === 3 && "pl-3",
                activeId === heading.id
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              )}
              title={heading.text}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

// Mobile TOC toggle
const MobileToc = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const headings = useMemo(() => {
    return extractHeadings(content).filter(h => h.level >= 2 && h.level <= 3);
  }, [content]);

  if (headings.length < 4) return null;

  return (
    <div className="xl:hidden mb-6">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <List size={16} />
        Table of Contents
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <nav className="mt-3 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 max-h-60 overflow-y-auto">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => {
                    const el = document.getElementById(heading.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setIsOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left text-sm py-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
                    heading.level === 3 && "pl-3 text-xs"
                  )}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== Search Modal ====================

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const items: { name: string; path: string; file: string; category: string; snippet: string; nameMatch: boolean }[] = [];

    for (const section of menuStructure) {
      if (!section.items) continue;
      for (const item of section.items) {
        const nameMatch = item.name.toLowerCase().includes(q);
        const content = contentFiles[item.file] || '';
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
  }, [query]);

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
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') onClose();
                    if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].path);
                  }}
                  placeholder="Search guides and content..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-slate-400"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                  ESC
                </kbd>
              </div>

              {query.length >= 2 && (
                <div className="max-h-[50vh] overflow-y-auto p-2">
                  {results.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500">
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
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.snippet}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {query.length < 2 && (
                <div className="px-5 py-6 text-sm text-slate-500 text-center">
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

const OfficialDocsBar = ({ filePath }: { filePath: string }) => {
  const guide = useMemo(() => {
    for (const section of menuStructure) {
      if (!section.items) continue;
      const item = section.items.find(i => i.file === filePath);
      if (item) return item;
    }
    return null;
  }, [filePath]);

  if (!guide?.officialDocs?.length) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-6 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 text-sm flex-wrap">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 shrink-0">
        <BookOpen size={15} className="text-indigo-500 dark:text-indigo-400" />
        <span>Official docs:</span>
      </div>
      {guide.officialDocs.map((doc, i) => (
        <a
          key={i}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline"
        >
          {doc.label}
          <ExternalLink size={12} />
        </a>
      ))}
    </div>
  );
};

// ==================== Content Page ====================

const ContentPage = ({ filePath, guidePath, guideName }: { filePath: string; guidePath?: string; guideName?: string }) => {
  const rawContent = contentFiles[filePath] || '# Not Found\n\nThe requested content could not be found.';
  const content = useMemo(() => stripMarkdownToc(rawContent), [rawContent]);
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightCount, setHighlightCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);
  const { getStatus, markInProgress, toggleComplete } = useProgress();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getCheckpoint, setCheckpoint, clearCheckpoint } = useCheckpoints();
  const { recordGuideCompleted } = useStudyStats();
  const guideStatus = guidePath ? getStatus(guidePath) : null;
  const checkpoint = guidePath ? getCheckpoint(guidePath) : null;

  // Dynamic page title for SEO
  useEffect(() => {
    const pageTitle = guideName ? `${guideName} — PrepHub` : 'PrepHub — Interview Prep';
    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && guideName) {
      metaDesc.setAttribute('content', `${guideName} interview preparation guide — PrepHub`);
    }
    return () => { document.title = 'PrepHub — Interview Prep'; };
  }, [guideName]);

  // Hash-based scroll-to-heading on mount. The element may not exist on the
  // first frame because ReactMarkdown renders the body after this effect
  // commits — poll with rAF up to ~1s, then give up.
  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    let cancelled = false;
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (tries++ < 60) requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelled = true; };
  }, [location.hash, content]);

  // ===== Feature 1: Related Guides Suggestions =====
  const relatedGuides = useMemo(() => {
    if (!guidePath) return [];
    // Find current category. Narrow to sections that have items so TS
    // knows the .items property is defined throughout this block.
    type CategoryWithItems = MenuSection & { items: MenuItem[] };
    const hasItems = (s: MenuSection): s is CategoryWithItems => Array.isArray(s.items);
    const categoriesWithItems: CategoryWithItems[] = menuStructure.filter(hasItems);
    let currentCategory: CategoryWithItems | null = null;
    let currentCategoryIndex = -1;
    for (let i = 0; i < categoriesWithItems.length; i++) {
      if (categoriesWithItems[i].items.some(item => item.path === guidePath)) {
        currentCategory = categoriesWithItems[i];
        currentCategoryIndex = i;
        break;
      }
    }
    if (!currentCategory) return [];

    // Get other guides from same category
    let related: MenuItem[] = currentCategory.items.filter(item => item.path !== guidePath);

    // If fewer than 2, pull from adjacent categories
    if (related.length < 2) {
      const adjacentIndices = [currentCategoryIndex - 1, currentCategoryIndex + 1].filter(
        i => i >= 0 && i < categoriesWithItems.length
      );
      for (const idx of adjacentIndices) {
        if (related.length >= 3) break;
        related = related.concat(categoriesWithItems[idx].items.slice(0, 3 - related.length));
      }
    }

    return related.slice(0, 3);
  }, [guidePath]);

  // Auto-mark in-progress on visit
  useEffect(() => {
    if (guidePath) markInProgress(guidePath);
  }, [guidePath, markInProgress]);

  const handleToggleComplete = () => {
    if (guidePath) {
      toggleComplete(guidePath);
      if (guideStatus !== 'completed') recordGuideCompleted();
    }
  };

  // Search highlighting
  useEffect(() => {
    if (!searchQuery || !containerRef.current) {
      setHighlightCount(0);
      return;
    }

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi');
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const parent = node.parentElement;
        if (parent && !parent.closest('pre, code, .code-block, .code-block-header')) {
          textNodes.push(node);
        }
      }

      let count = 0;
      let firstMark: HTMLElement | null = null;

      for (const node of textNodes) {
        const text = node.textContent ?? '';
        if (regex.test(text)) {
          regex.lastIndex = 0;
          const span = document.createElement('span');
          span.innerHTML = text.replace(regex, '<mark class="search-hl">$1</mark>');
          node.parentNode?.replaceChild(span, node);
          const mark = span.querySelector('mark');
          if (mark && !firstMark) firstMark = mark as HTMLElement;
          count += (text.match(regex) || []).length;
        }
      }

      setHighlightCount(count);

      if (firstMark) {
        const target = firstMark;
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      containerRef.current?.querySelectorAll('mark.search-hl').forEach((m: Element) => {
        const parent = m.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(m.textContent ?? ''), m);
        parent.normalize();
      });
    };
  }, [searchQuery, filePath]);

  const createHeading = useCallback((level: number) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const HeadingComponent: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => {
      const text = getTextContent(children);
      const id = slugify(text);
      const bookmarkId = guidePath ? `${guidePath.replace(/\//g, '-').slice(1)}__${id}` : null;
      const isMarked = bookmarkId ? isBookmarked(bookmarkId) : false;

      return (
        <Tag id={id} className="group relative" {...props}>
          {children}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const url = `${window.location.origin}${window.location.pathname}#${id}`;
              navigator.clipboard.writeText(url).then(() => setToastMsg('Link copied!'));
            }}
            className="heading-anchor"
            aria-label="Copy link"
          >
            <Link2 size={level <= 2 ? 20 : 18} />
          </button>
          {bookmarkId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark({ id: bookmarkId, guidePath, guideName: guideName || '', headingId: id, headingText: text, type: 'heading' });
              }}
              className={cn("heading-bookmark", isMarked && "bookmarked")}
              aria-label={isMarked ? "Remove bookmark" : "Bookmark section"}
            >
              {isMarked ? <BookmarkCheck size={level <= 2 ? 20 : 18} /> : <Bookmark size={level <= 2 ? 20 : 18} />}
            </button>
          )}
        </Tag>
      );
    };
    return HeadingComponent;
  }, [guidePath, guideName, isBookmarked, toggleBookmark]);

  return (
    <>
      <motion.div
        key={filePath}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn("px-6 py-8 md:px-12 md:py-12", !isTocCollapsed && "xl:mr-64")}
      >
        {/* Search highlight banner */}
        {searchQuery && highlightCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 mb-6 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/50 text-sm">
            <span className="text-yellow-800 dark:text-yellow-300">
              Found <strong>{highlightCount}</strong> match{highlightCount !== 1 ? 'es' : ''} for &ldquo;{searchQuery}&rdquo;
            </span>
            <Link
              to={location.pathname}
              className="text-yellow-600 dark:text-yellow-400 hover:underline text-xs font-medium"
            >
              Clear
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            ~{estimateReadingTime(content)} min read
          </span>
          {guidePath && (
            <button
              onClick={handleToggleComplete}
              className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors", guideStatus === 'completed' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              {guideStatus === 'completed' ? <CheckCircle size={13} /> : <Circle size={13} />}
              {guideStatus === 'completed' ? 'Completed' : 'Mark Complete'}
            </button>
          )}
        </div>

        <OfficialDocsBar filePath={filePath} />

        {checkpoint && guidePath && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50"
          >
            <Flag size={16} className="text-indigo-500 fill-indigo-500/30 shrink-0" />
            <button
              onClick={() => {
                const el = document.getElementById(checkpoint.headingId);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                else setToastMsg('Checkpoint heading no longer exists in this guide');
              }}
              className="flex-1 min-w-0 text-left text-sm group"
            >
              <span className="text-indigo-700 dark:text-indigo-300">Continue from </span>
              <span className="font-semibold text-indigo-900 dark:text-indigo-100 group-hover:underline truncate">
                &ldquo;{checkpoint.headingText}&rdquo;
              </span>
            </button>
            <button
              onClick={() => clearCheckpoint(guidePath)}
              className="p-1 rounded-lg text-indigo-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shrink-0"
              aria-label="Clear checkpoint"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        <MobileToc content={content} />

        <div ref={containerRef} className="prose-container">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: createHeading(1),
              h2: createHeading(2),
              h3: createHeading(3),
              h4: createHeading(4),
              pre({ children }) {
                // Detect mermaid code blocks
                const child = React.Children.toArray(children)[0];
                if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(child) && child.props?.className?.includes('language-mermaid')) {
                  const code = typeof child.props.children === 'string' ? child.props.children : '';
                  return <MermaidBlock chart={code} />;
                }
                return <PreBlock>{children}</PreBlock>;
              },
              code({ className, children, node, ...props }) {
                if (className?.includes('language-') || className?.includes('hljs')) {
                  return <code className={className} {...props}>{children}</code>;
                }
                return <code className="inline-code" {...props}>{children}</code>;
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <table>{children}</table>
                  </div>
                );
              },
              a({ href, children, ...props }) {
                const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
                return (
                  <a
                    href={href}
                    className="content-link"
                    {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    {...props}
                  >
                    {children}
                    {isExternal && <ExternalLink size={12} className="inline ml-1 -mt-0.5" />}
                  </a>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Feature 2: Related Guides Suggestions */}
        {relatedGuides.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <BookOpen size={14} />
              Continue Learning
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedGuides.map(guide => {
                const readTime = estimateReadingTime(contentFiles[guide.file] || '');
                const category = menuStructure.find(s => s.items?.some(i => i.path === guide.path));
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
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        ~{readTime}m
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      <TableOfContents content={content} isCollapsed={isTocCollapsed} onToggle={() => setIsTocCollapsed(c => !c)} />
      {guidePath && guideName && (
        <SaveCheckpointFab
          onSave={() => {
            const heading = findNearestHeadingAbove();
            if (!heading || !heading.id) {
              setToastMsg('No heading found to checkpoint');
              return;
            }
            setCheckpoint(guidePath, {
              headingId: heading.id,
              headingText: heading.text,
              guideName,
            });
            setToastMsg(`Checkpoint saved at "${heading.text}"`);
          }}
        />
      )}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </>
  );
};

// ==================== Save Checkpoint FAB ====================

// Finds the heading whose top is just above (or at) the given threshold from
// the viewport top. Falls back to the first heading if the user is at the very
// top of the page. Returns null only when the guide has no headings at all.
function findNearestHeadingAbove(threshold: number = 100): { id: string; text: string } | null {
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
  return { id: best.id, text: best.textContent?.trim().replace(/[#¶​]/g, '').trim() ?? '' };
}

const SaveCheckpointFab = ({ onSave }: { onSave: () => void }) => {
  const [show, setShow] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    onSave();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={handleClick}
          className={cn(
            "fixed bottom-24 right-6 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg border transition-all z-50",
            savedFlash
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:shadow-xl hover:-translate-y-0.5"
          )}
          aria-label="Save checkpoint at current position"
        >
          {savedFlash ? <Check size={16} /> : <Flag size={16} className="text-indigo-500" />}
          <span className="text-xs font-medium">{savedFlash ? 'Saved' : 'Save Checkpoint'}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ==================== Back to Top ====================

const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-0.5 transition-all z-50"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ==================== Main App ====================

const CHANGELOG_VERSION = '2026-04-tricky-rewrite';

export default function App() {
  const { theme, toggleTheme } = useDarkMode();
  const { fontSize, cycleFontSize, sizeLabel } = useReadingPrefs();
  const progressHook = useProgress();
  const bookmarksHook = useBookmarks();
  const checkpointsHook = useCheckpoints();
  const checkpointsCount = Object.keys(checkpointsHook.checkpoints).length;
  const srHook = useSpacedRepetition();
  const statsHook = useStudyStats();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [milestone, setMilestone] = useState<number | null>(null);
  const location = useLocation();
  const isContentPage = location.pathname !== '/' && location.pathname !== '/quiz' && location.pathname !== '/playground' && location.pathname !== '/changelog' && location.pathname !== '/bookmarks' && location.pathname !== '/review' && location.pathname !== '/interview' && !location.pathname.startsWith('/cheatsheets');
  const hasUnreadChangelog = localStorage.getItem('lastSeenChangelog') !== CHANGELOG_VERSION;
  const allGuides = useMemo(() => menuStructure.flatMap(s => s.items || []), []);
  const dueCount = useMemo(() => srHook.getDueCount(getAllQuestions()), [srHook]);

  // Record visit + check streak milestone
  useEffect(() => {
    statsHook.recordVisit();
    const m = statsHook.checkMilestone();
    if (m) setMilestone(m);
  }, []);

  // Allow pages (e.g. playground) to request showing the sidebar
  useEffect(() => {
    const handler = () => {
      setIsSidebarCollapsed(false);
      setIsSidebarOpen(true);
    };
    window.addEventListener('prephub:show-sidebar', handler);
    return () => window.removeEventListener('prephub:show-sidebar', handler);
  }, []);

  // Mark changelog as seen
  useEffect(() => {
    if (location.pathname === '/changelog') {
      localStorage.setItem('lastSeenChangelog', CHANGELOG_VERSION);
    }
  }, [location.pathname]);

  useEffect(() => {
    const currentSection = menuStructure.find(s =>
      s.items?.some(i => i.path === location.pathname)
    );
    if (currentSection) {
      setExpandedSections(prev => ({ ...prev, [currentSection.name]: true }));
    }
  }, [location.pathname]);

  // Dynamic page titles for non-content pages
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/': 'PrepHub — Free Full-Stack Interview Prep Guides',
      '/quiz': 'Quiz Mode — PrepHub',
      '/playground': 'Code Playground — PrepHub',
      '/interview': 'Interview Simulator — PrepHub',
      '/review': 'Spaced Repetition Review — PrepHub',
      '/bookmarks': 'Bookmarks — PrepHub',
      '/cheatsheets': 'Cheat Sheets — PrepHub',
      '/changelog': "What's New — PrepHub",
    };
    const title = pageTitles[location.pathname];
    if (title) document.title = title;
  }, [location.pathname]);

  // Track SPA page views in Google Analytics
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ===== Feature 3: Keyboard Navigation =====
  const navigate = useNavigate();
  const flatGuidePaths = useMemo(() => {
    return menuStructure.flatMap(section => (section.items || []).map(item => item.path));
  }, []);

  useEffect(() => {
    const handleArrowNav = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      // Plain arrow keys must scroll the page — only intercept with Alt held.
      // (Cmd is taken by browser history back/forward; Ctrl by some OS shortcuts.)
      if (!e.altKey) return;

      // Don't navigate when focus is in an input, textarea, or search-related element
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || active?.isContentEditable) return;

      const currentIndex = flatGuidePaths.indexOf(location.pathname);
      if (currentIndex === -1) return;

      e.preventDefault();
      let nextIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex + 1 < flatGuidePaths.length ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : flatGuidePaths.length - 1;
      }
      navigate(flatGuidePaths[nextIndex]);
    };

    window.addEventListener('keydown', handleArrowNav);
    return () => window.removeEventListener('keydown', handleArrowNav);
  }, [location.pathname, flatGuidePaths, navigate]);

  const toggleSection = (name: string) => {
    setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      <ReadingProgress />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <BackToTop />
      <StreakCelebration milestone={milestone} onClose={() => setMilestone(null)} />

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 z-50 md:hidden">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="text-base">PrepHub</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Search size={18} />
          </button>
          <button onClick={cycleFontSize} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" title={`Font size: ${fontSize}`}>
            <Type size={18} />
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded px-0.5">{sizeLabel}</span>
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar expand button (desktop, when collapsed). Hidden on /playground — the playground has its own inline toggle to avoid overlapping the editor. */}
      {isSidebarCollapsed && location.pathname !== '/playground' && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden md:flex fixed top-1/2 -translate-y-1/2 left-0 z-[55] py-3 px-1 rounded-r-lg bg-slate-200/80 dark:bg-slate-800/80 border border-l-0 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 hover:px-2 transition-all"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={14} className="text-slate-500 dark:text-slate-400" />
        </button>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-72 bg-white/95 dark:bg-[#0c0c14]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 z-[70] transition-all duration-300 flex flex-col",
        !isSidebarOpen && "-translate-x-full",
        isSidebarCollapsed ? "md:-translate-x-full" : "md:translate-x-0"
      )}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                <BookOpen size={16} className="text-white" />
              </div>
              <span>PrepHub</span>
            </Link>
            <div className="flex items-center gap-1">
              <button onClick={cycleFontSize} className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative" title={`Font size: ${fontSize}`}>
                <Type size={16} />
                <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded px-0.5">{sizeLabel}</span>
              </button>
              <button onClick={toggleTheme} className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button onClick={() => setIsSidebarCollapsed(true)} className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Collapse sidebar">
                <PanelLeftClose size={16} />
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">⌘K</kbd>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 sidebar-scroll">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              location.pathname === '/'
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            )}
          >
            <BookOpen size={16} /> Home
          </Link>

          {menuStructure.filter((s): s is MenuSection & { items: MenuItem[] } => Array.isArray(s.items)).map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.name];
            const hasActiveChild = section.items.some(i => i.path === location.pathname);

            return (
              <div key={section.name} className="pt-2">
                <button
                  onClick={() => toggleSection(section.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    hasActiveChild
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                  )}
                >
                  {Icon && <Icon size={16} className={cn(hasActiveChild && section.accent)} />}
                  <span className="flex-1 text-left">{section.name}</span>
                  <ChevronDown size={14} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-0.5 py-1">
                        {section.items.map(item => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                              location.pathname === item.path
                                ? cn(section.lightBg, section.darkBg, section.accent, "shadow-sm")
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Cheat Sheets */}
          <div className="pt-2">
            <button
              onClick={() => toggleSection('Cheat Sheets')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                location.pathname.startsWith('/cheatsheets')
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <ScrollText size={16} className={cn(location.pathname.startsWith('/cheatsheets') && "text-rose-500")} />
              <span className="flex-1 text-left">Cheat Sheets</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", expandedSections['Cheat Sheets'] && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {expandedSections['Cheat Sheets'] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-0.5 py-1">
                    {cheatSheets.map(cs => (
                      <Link key={cs.path} to={cs.path} className={cn("flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all", location.pathname === cs.path ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900")}>
                        {cs.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tools */}
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Tools</span>
            <div className="mt-2 space-y-0.5">
              <Link to="/quiz" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", location.pathname === '/quiz' ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <Zap size={16} /> Quiz Mode
              </Link>
              <Link to="/review" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", location.pathname === '/review' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <RotateCcw size={16} /> Daily Review
                {dueCount > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">{dueCount}</span>}
              </Link>
              <Link to="/interview" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", location.pathname === '/interview' ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <GraduationCap size={16} /> Interview Sim
              </Link>
              <Link to="/playground" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", location.pathname === '/playground' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <Terminal size={16} /> Playground
              </Link>
              <Link to="/bookmarks" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", location.pathname === '/bookmarks' ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <Bookmark size={16} /> Bookmarks
                {bookmarksHook.bookmarks.length > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{bookmarksHook.bookmarks.length}</span>}
              </Link>
              <Link to="/checkpoints" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", location.pathname === '/checkpoints' ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <Flag size={16} /> Checkpoints
                {checkpointsCount > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{checkpointsCount}</span>}
              </Link>
              <Link to="/changelog" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", location.pathname === '/changelog' ? "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <Sparkles size={16} /> What's New
                {hasUnreadChangelog && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ml-auto" />}
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-0.5">
          <a
            href="https://github.com/sreen98/prephub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            <GithubIcon size={16} />
            <span>View on GitHub</span>
          </a>
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
              location.pathname === '/admin'
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
            )}
          >
            <Lock size={14} />
            <span>Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 w-full min-w-0 pt-14 md:pt-0", !isSidebarCollapsed && "md:ml-72")}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizMode />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/interview" element={<InterviewSimulator />} />
            <Route path="/playground" element={<CodePlayground />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/checkpoints" element={<CheckpointsPage />} />
            <Route path="/changelog" element={<ContentPage filePath="./content/changelog.md" />} />
            <Route path="/cheatsheets" element={<CheatSheetsIndex />} />
            <Route path="/admin" element={<AdminPage />} />
            {cheatSheets.map(cs => (
              <Route key={cs.path} path={cs.path} element={<ContentPage filePath={cs.file} />} />
            ))}
            {menuStructure.flatMap(section => section.items || []).map(item => (
              <Route
                key={item.path}
                path={item.path}
                element={<ContentPage filePath={item.file} guidePath={item.path} guideName={item.name} />}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
