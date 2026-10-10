import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sun, Moon, ChevronDown, BookOpen, Search, Megaphone, Type, Flame,
  GraduationCap, Bookmark, Flag, ScrollText, Lock, PanelLeftClose, FileText,
  CheckCircle, Circle, Zap, Terminal, List, Braces, Server, Layers, Monitor,
  RotateCcw, Database, Atom,
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

/** The one active-link style, shared by Home, guides and tools. */
const ACTIVE = 'bg-accent-soft text-accent';
/** Inactive links: muted text that darkens on hover. */
const INACTIVE = 'text-muted hover:text-ink hover:bg-ink/5';

interface ToolCounts { dueCount: number; bookmarksCount: number; checkpointsCount: number; hasUnreadChangelog: boolean }

const countBadge = (n: number, tone = 'bg-ink/5 text-muted') =>
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
  badge?: (c: ToolCounts) => React.ReactNode;
}[] = [
  { to: '/quiz', Icon: Zap, label: 'Quiz Mode' },
  { to: '/review', Icon: RotateCcw, label: 'Daily Review',
    badge: (c) => countBadge(c.dueCount, 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold') },
  { to: '/interview', Icon: GraduationCap, label: 'Interview Sim' },
  { to: '/playground', Icon: Terminal, label: 'JavaScript Playground' },
  { to: '/playground/react', Icon: Atom, label: 'React Playground' },
  { to: '/query-playground', Icon: Database, label: 'Query Playground' },
  { to: '/bookmarks', Icon: Bookmark, label: 'Bookmarks',
    badge: (c) => countBadge(c.bookmarksCount) },
  { to: '/checkpoints', Icon: Flag, label: 'Checkpoints',
    badge: (c) => countBadge(c.checkpointsCount) },
  { to: '/changelog', Icon: Megaphone, label: "What's New",
    badge: (c) => (c.hasUnreadChangelog
      ? <span className="w-2 h-2 rounded-full bg-accent ml-auto" aria-label="unread" />
      : null) },
];

export default function Sidebar({
  isSidebarOpen, isSidebarCollapsed, setIsSidebarOpen, setIsSidebarCollapsed,
  setIsSearchOpen, expandedSections, toggleSection, dueCount, checkpointsCount,
  bookmarksCount, hasUnreadChangelog, theme, toggleTheme, cycleFontSize,
  fontSize, sizeLabel, appVersion,
}: SidebarProps) {
  // MUST come from the router, not `window.location`: under a basename (the app
  // was served from /prephub/ on GitHub Pages until v1.7.9), window.location.pathname
  // is '/prephub/quiz' and never equals '/quiz', so every active-state highlight
  // would be dead. The site is at the domain root now, which would only hide the bug.
  const location = useLocation();
  const counts: ToolCounts = { dueCount, bookmarksCount, checkpointsCount, hasUnreadChangelog };

  return (
        <aside className={cn(
          "fixed top-0 left-0 h-screen w-72 bg-surface border-r border-line z-[70] transition-all duration-300 flex flex-col",
          !isSidebarOpen && "-translate-x-full",
          isSidebarCollapsed ? "md:-translate-x-full" : "md:translate-x-0"
        )}>
          <div className="p-5 border-b border-line">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5 font-bold text-lg group">
                <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
                  <BookOpen size={16} className="text-accent-contrast" />
                </div>
                <span>PrepHub</span>
              </Link>
              <div className="flex items-center gap-1">
                <button onClick={cycleFontSize} className="hidden md:flex p-2 hover:bg-ink/5 rounded-lg transition-colors relative" title={`Font size: ${fontSize}`}>
                  <Type size={16} />
                  <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold bg-accent-soft text-accent rounded px-0.5">{sizeLabel}</span>
                </button>
                <button onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} className="hidden md:flex p-2 hover:bg-ink/5 rounded-lg transition-colors">
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <button onClick={() => setIsSidebarCollapsed(true)} className="hidden md:flex p-2 hover:bg-ink/5 rounded-lg transition-colors" title="Collapse sidebar">
                  <PanelLeftClose size={16} />
                </button>
                <button onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation" className="md:hidden p-2 hover:bg-ink/5 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-canvas border border-line text-sm text-muted hover:text-ink hover:border-ink/30 transition-colors"
            >
              <Search size={14} />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-surface border border-line font-mono">⌘K</kbd>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 sidebar-scroll">
            <Link
              to="/"
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === '/' ? ACTIVE : INACTIVE
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
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all",
                      hasActiveChild
                        ? "text-ink"
                        : "text-muted hover:text-ink hover:bg-ink/5"
                    )}
                  >
                    {Icon && <Icon size={16} className={cn(hasActiveChild && "text-accent")} />}
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
                        <div className="ml-4 pl-3 border-l-2 border-line space-y-0.5 py-1">
                          {/* A group heading previously sat at the same left edge, size and
                              weight as the links under it, so it read as another item. It now
                              gets a rule above, wider tracking, and the links are indented
                              beneath it — three cues rather than one. */}
                          {groupSidebarItems(section.items).map((bucket, bucketIndex) => (
                            <div
                              key={bucket.label ?? '_ungrouped'}
                              className={cn(bucket.label && bucketIndex > 0 && "mt-2 pt-2 border-t border-line")}
                            >
                              {bucket.label && (
                                <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                                  {bucket.label}
                                </p>
                              )}
                              {bucket.items.map(item => (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  aria-current={location.pathname === item.path ? 'page' : undefined}
                                  className={cn(
                                    "flex items-center py-2 rounded-md text-[13px] font-medium transition-colors",
                                    bucket.label ? "pl-5 pr-3" : "px-3",
                                    location.pathname === item.path ? ACTIVE : INACTIVE
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
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all",
                  location.pathname.startsWith('/cheatsheets')
                    ? "text-ink"
                    : "text-muted hover:text-ink hover:bg-ink/5"
                )}
              >
                <ScrollText size={16} className={cn(location.pathname.startsWith('/cheatsheets') && "text-accent")} />
                <span className="flex-1 text-left">Cheat Sheets</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200", expandedSections['Cheat Sheets'] && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {expandedSections['Cheat Sheets'] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="ml-4 pl-3 border-l-2 border-line space-y-0.5 py-1">
                      {cheatSheets.map(cs => (
                        <Link key={cs.path} to={cs.path} aria-current={location.pathname === cs.path ? 'page' : undefined} className={cn("flex items-center px-3 py-2 rounded-md text-[13px] font-medium transition-colors", location.pathname === cs.path ? ACTIVE : INACTIVE)}>
                          {cs.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tools */}
            <div className="pt-4 mt-2 border-t border-line">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-3">Tools</span>
              <div className="mt-2 space-y-0.5">
                {TOOLS.map(({ to, Icon, label, badge }) => (
                  <Link
                    key={to}
                    to={to}
                    aria-current={location.pathname === to ? 'page' : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      location.pathname === to ? ACTIVE : INACTIVE,
                    )}
                  >
                    <Icon size={16} /> {label}
                    {badge?.(counts)}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-line space-y-0.5">
            <a
              href="https://github.com/sreen98/prephub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-muted hover:text-ink hover:bg-ink/5 transition-all"
            >
              <GithubIcon size={16} />
              <span>View on GitHub</span>
            </a>
            {/* Passphrase-protected; the page ships only ciphertext. See AdminPage.tsx. */}
            <Link
              to="/admin"
              aria-current={location.pathname === '/admin' ? 'page' : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors",
                location.pathname === '/admin' ? ACTIVE : INACTIVE
              )}
            >
              <Lock size={14} />
              <span>Admin</span>
            </Link>

            {/* Which build is being served. Useful when a cached service worker
                is still handing out an older bundle than the latest deploy. */}
            <p className="px-3 pt-2 flex items-center gap-3 text-[11px] text-muted">
              <span className="tabular-nums">v{appVersion}</span>
              <Link to="/privacy" className="hover:text-ink underline-offset-2 hover:underline">Privacy</Link>
              <Link to="/terms" className="hover:text-ink underline-offset-2 hover:underline">Terms</Link>
            </p>
          </div>
        </aside>
  );
}
