import { useState, useEffect, useMemo } from 'react';
import { extractHeadings } from '../../data';
import { cn } from '../../lib/cn';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';


export const TableOfContents = ({ content, isCollapsed, onToggle }: { content: string; isCollapsed: boolean; onToggle: () => void }) => {
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
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            On this page
          </h4>
          <button onClick={onToggle} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" title="Hide table of contents">
            <PanelLeftClose size={12} className="text-slate-500 dark:text-slate-400 rotate-180" />
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
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
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

export default TableOfContents;
