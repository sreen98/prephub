import React, { useState, useEffect, useMemo, useRef, useSyncExternalStore, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
import type { MenuSection, MenuItem } from './data';
import { menuStructure, cheatSheets, totalQuestionCount, subscribePendingLoads, getPendingLoads } from './data';
import { useReadingPrefs } from './hooks/useReadingPrefs';
import { useBookmarks } from './hooks/useBookmarks';
import { useCheckpoints } from './hooks/useCheckpoints';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { useStudyStats } from './hooks/useStudyStats';
import MermaidBlock from './components/MermaidBlock';
import StreakCelebration from './components/StreakCelebration';
import Toast from './components/Toast';
// Single source of truth for the version, so the sidebar can't drift from
// package.json. Named import so only the string is bundled, not the whole file.
import { version as APP_VERSION } from '../package.json';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import Sidebar from './components/Sidebar';
import SearchModal from './components/SearchModal';
import { cn } from './lib/cn';
import { safeGet, safeSet } from './lib/storage';

// Route-level code splitting. Each gets its own bundle chunk so users on
// other routes don't pay for code they aren't using.
const HomePage           = lazy(() => import('./pages/HomePage'));
const QuizMode           = lazy(() => import('./pages/QuizMode'));
const CodePlayground     = lazy(() => import('./features/playground/CodePlayground'));
const BookmarksPage      = lazy(() => import('./pages/BookmarksPage'));
const CheckpointsPage    = lazy(() => import('./pages/CheckpointsPage'));
const ReviewPage         = lazy(() => import('./pages/ReviewPage'));
const InterviewSimulator = lazy(() => import('./pages/InterviewSimulator'));
const CheatSheetsIndex   = lazy(() => import('./pages/CheatSheetsIndex'));
// PGlite (real PostgreSQL in WASM) is ~5 MB and lives behind this route's
// own dynamic import, so it is never fetched unless someone opens it.
const QueryPlayground    = lazy(() => import('./pages/QueryPlayground'));
// Lazy specifically so the markdown pipeline (react-markdown + remark +
// rehype, shipped as `vendor-markdown`) leaves the entry payload. It was
// eager only because ContentPage used to live in this module, so a visitor
// who opened just the home page — which renders no markdown — still paid
// ~327 KB for the renderer.
const ContentPage        = lazy(() => import('./pages/ContentPage'));
// Local-development only. `import.meta.env.DEV` is a compile-time constant, so
// this dynamic import is dead-code-eliminated in a production build and the
// AdminPage chunk is never emitted — which is what keeps `private/` out of
// dist/ even when the build runs on a machine that has the file. See AdminPage.tsx.
const AdminPage = (import.meta.env.DEV
  ? lazy(() => import('./pages/AdminPage'))
  : () => null) as React.ComponentType;

// Loader shown while a lazy route chunk is being fetched.
// Pulse-skeleton hints at the upcoming page shape so the transition
// feels quieter than a spinner pop-in.
// Thin top-of-page progress bar, driven by ACTUAL in-flight content fetches
// (subscribePendingLoads in data.ts) rather than a timer. Content is lazy-
// loaded, so clicking a guide can involve a network round trip; without this
// the previous page just sits there with no feedback.
//
// Renders nothing at zero, and nothing for cached content either — loadContent
// skips the counter on a cache hit, so revisiting a guide doesn't flash a bar.
const TopProgressBar = () => {
  const pending = useSyncExternalStore(subscribePendingLoads, getPendingLoads, getPendingLoads);
  if (pending === 0) return null;
  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 z-[100] overflow-hidden bg-indigo-500/25"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="h-full w-1/3 bg-indigo-500 progress-slide" />
    </div>
  );
};

// Skeleton for a guide whose markdown is still being fetched. Mirrors the shape
// of a rendered guide so the layout doesn't jump when the content lands.

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
    <div className="mt-8 flex items-center gap-3 text-slate-500 dark:text-slate-400">
      <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-indigo-500 animate-spin" />
      <span className="text-xs font-medium">Loading…</span>
    </div>
  </div>
);




// Strip the markdown "## Table of Contents" section (the app generates its own TOC)

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


// ==================== Table of Contents ====================


// Mobile TOC toggle

// ==================== Search Modal ====================


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

const CHANGELOG_VERSION = '2026-09-perf-a11y';

export default function App() {
  const { theme, toggleTheme } = useDarkMode();
  const { fontSize, cycleFontSize, sizeLabel } = useReadingPrefs();
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
  const hasUnreadChangelog = safeGet('lastSeenChangelog') !== CHANGELOG_VERSION;
  // getDueCount treats an unseen question as due, so it needs the real TOTAL —
  // but only the total, never the text. This used to call getAllQuestions(),
  // which loads every guide: Lighthouse caught the home page fetching 64 guide
  // chunks (1.6 MB, High priority) purely to size this badge, which on a
  // throttled connection saturated the network and pushed simulated LCP to
  // 12.8 s. Deferring to requestIdleCallback had hidden it locally — idle time
  // delays when the download starts, not how much it costs.
  //
  // `totalQuestionCount` is computed at build time, so the badge is now a
  // synchronous read of localStorage with no network at all, and no effect.
  const dueCount = srHook.getDueCountFromTotal(totalQuestionCount);

  // Record visit + check streak milestone. Runs once per mount; `statsHook`
  // is listed so the dep array is honest, and the guard keeps it once-only
  // even though the hook object identity changes on every stats update.
  const visitRecorded = useRef(false);
  useEffect(() => {
    if (visitRecorded.current) return;
    visitRecorded.current = true;
    statsHook.recordVisit();
    const m = statsHook.checkMilestone();
    // One-shot milestone check on mount — nothing to derive from at render time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (m) setMilestone(m);
  }, [statsHook]);

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
      safeSet('lastSeenChangelog', CHANGELOG_VERSION);
    }
  }, [location.pathname]);

  useEffect(() => {
    const currentSection = menuStructure.find(s =>
      s.items?.some(i => i.path === location.pathname)
    );
    if (currentSection) {
      // Auto-expand the section holding the current route. Additive, so it must
      // merge with whatever the user has already toggled — not derivable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedSections(prev => ({ ...prev, [currentSection.name]: true }));
    }
  }, [location.pathname]);

  // Dynamic page titles for non-content pages
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/': 'PrepHub — Free Full-Stack Interview Prep Guides',
      '/quiz': 'Quiz Mode — PrepHub',
      '/playground': 'Code Playground — PrepHub',
      '/query-playground': 'Query Playground — PrepHub',
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
    // Closing the mobile sidebar is a response to navigation, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
    // Only reset scroll for a plain navigation. With a hash, ContentPage's
    // hash-scroll effect is targeting a heading — and because React runs child
    // effects BEFORE parent effects, an unconditional scrollTo(0,0) here fires
    // immediately after it and undoes it. That is why "Continue" from
    // Checkpoints and Bookmarks landed at the top of the guide, while the
    // in-page banner worked (it changes no pathname, so this never ran).
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

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
        <button onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="text-base">PrepHub</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsSearchOpen(true)} aria-label="Search guides" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Search size={18} />
          </button>
          <button onClick={cycleFontSize} aria-label={`Text size: ${fontSize}. Tap to change.`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" title={`Font size: ${fontSize}`}>
            <Type size={18} />
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded px-0.5">{sizeLabel}</span>
          </button>
          <button onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarOpen={setIsSidebarOpen}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        setIsSearchOpen={setIsSearchOpen}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        dueCount={dueCount}
        checkpointsCount={checkpointsCount}
        bookmarksCount={bookmarksHook.bookmarks.length}
        hasUnreadChangelog={hasUnreadChangelog}
        theme={theme}
        toggleTheme={toggleTheme}
        cycleFontSize={cycleFontSize}
        fontSize={fontSize}
        sizeLabel={sizeLabel}
        appVersion={APP_VERSION}
      />

      <TopProgressBar />

      {/* Main Content */}
      <main className={cn("flex-1 w-full min-w-0 pt-14 md:pt-0", !isSidebarCollapsed && "md:ml-72")}>
        <RouteErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizMode />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/interview" element={<InterviewSimulator />} />
            <Route path="/playground" element={<CodePlayground />} />
            <Route path="/query-playground" element={<QueryPlayground />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/checkpoints" element={<CheckpointsPage />} />
            <Route path="/changelog" element={<ContentPage filePath="./content/changelog.md" />} />
            <Route path="/cheatsheets" element={<CheatSheetsIndex />} />
            {import.meta.env.DEV && <Route path="/admin" element={<AdminPage />} />}
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
        </RouteErrorBoundary>
      </main>
    </div>
  );
}
