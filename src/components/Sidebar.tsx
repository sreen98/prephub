import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sun, Moon, ChevronDown, BookOpen, Search, Sparkles, Type, Flame,
  GraduationCap, Bookmark, Flag, ScrollText, Lock, PanelLeftClose, FileText,
  CheckCircle, Circle, Zap, Terminal, List, Braces, Server, Layers, Monitor,
  RotateCcw, Database,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { menuStructure, cheatSheets } from '../data';
import type { MenuItem, MenuSection } from '../data';
import { cn } from '../lib/cn';
import { groupSidebarItems } from '../lib/groupSidebarItems';

// The app's navigation rail. Extracted from App.tsx, whose component function
// was 412 lines against a 300-line limit with a cyclomatic complexity of 28 —
// most of it this markup. The props are explicit rather than a context because
// App owns all of this state and there is exactly one consumer; a context here
// would hide the coupling without reducing it.

export interface SidebarProps {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  expandedSections: Record<string, boolean>;
  toggleSection: (name: string) => void;
  dueCount: number;
  checkpointsCount: number;
  bookmarksCount: number;
  hasUnreadChangelog: boolean;
  theme: string;
  toggleTheme: () => void;
  cycleFontSize: () => void;
  fontSize: string;
  sizeLabel: string;
  appVersion: string;
}

/** Tailwind classes for an active tool link, by accent colour. */
const ACCENTS: Record<string, string> = {
  amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shadow-sm',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm',
  violet: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 shadow-sm',
};

interface ToolCounts { dueCount: number; bookmarksCount: number; checkpointsCount: number; hasUnreadChangelog: boolean }

const countBadge = (n: number, tone = 'bg-slate-100 dark:bg-slate-800 text-slate-500') =>
  n > 0 ? <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${tone}`}>{n}</span> : null;

/**
 * The Tools list was seven near-identical <Link> blocks, each repeating the
 * same active/inactive ternary — which alone took this component over the
 * complexity limit. As a table, adding a tool is one row.
 */
const TOOLS: {
  to: string;
  Icon: typeof Zap;
  label: string;
  accent: keyof typeof ACCENTS;
  badge?: (c: ToolCounts) => React.ReactNode;
}[] = [
  { to: '/quiz', Icon: Zap, label: 'Quiz Mode', accent: 'amber' },
  { to: '/review', Icon: RotateCcw, label: 'Daily Review', accent: 'emerald',
    badge: (c) => countBadge(c.dueCount, 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold') },
  { to: '/interview', Icon: GraduationCap, label: 'Interview Sim', accent: 'indigo' },
  { to: '/playground', Icon: Terminal, label: 'Code Playground', accent: 'emerald' },
  { to: '/query-playground', Icon: Database, label: 'Query Playground', accent: 'indigo' },
  { to: '/bookmarks', Icon: Bookmark, label: 'Bookmarks', accent: 'amber',
    badge: (c) => countBadge(c.bookmarksCount) },
  { to: '/checkpoints', Icon: Flag, label: 'Checkpoints', accent: 'indigo',
    badge: (c) => countBadge(c.checkpointsCount) },
  { to: '/changelog', Icon: Sparkles, label: "What's New", accent: 'violet',
    badge: (c) => (c.hasUnreadChangelog
      ? <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ml-auto" />
      : null) },
];

export default function Sidebar({
  isSidebarOpen, isSidebarCollapsed, setIsSidebarOpen, setIsSidebarCollapsed,
  setIsSearchOpen, expandedSections, toggleSection, dueCount, checkpointsCount,
  bookmarksCount, hasUnreadChangelog, theme, toggleTheme, cycleFontSize,
  fontSize, sizeLabel, appVersion,
}: SidebarProps) {
  // MUST come from the router, not `window.location`: the app is served under
  // a /prephub/ basename, so window.location.pathname is '/prephub/quiz' and
  // would never equal '/quiz' — every active-state highlight would be dead.
  const location = useLocation();
  const counts: ToolCounts = { dueCount, bookmarksCount, checkpointsCount, hasUnreadChangelog };

  return (
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
                          {groupSidebarItems(section.items).map(bucket => (
                            <div key={bucket.label ?? '_ungrouped'}>
                              {bucket.label && (
                                <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                  {bucket.label}
                                </p>
                              )}
                              {bucket.items.map(item => (
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 px-3">Tools</span>
              <div className="mt-2 space-y-0.5">
                {TOOLS.map(({ to, Icon, label, accent, badge }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      location.pathname === to
                        ? ACCENTS[accent]
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900",
                    )}
                  >
                    <Icon size={16} /> {label}
                    {badge?.(counts)}
                  </Link>
                ))}
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
            {/* Local-development only — see AdminPage.tsx. Never ships. */}
            {import.meta.env.DEV && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
                  location.pathname === '/admin'
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
              >
                <Lock size={14} />
                <span>Admin</span>
              </Link>
            )}

            {/* Which build is being served. Useful when a cached service worker
                is still handing out an older bundle than the latest deploy. */}
            <p className="px-3 pt-2 text-[11px] tabular-nums text-slate-600 dark:text-slate-400">
              v{appVersion}
            </p>
          </div>
        </aside>
  );
}
