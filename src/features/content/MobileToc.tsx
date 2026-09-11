import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractHeadings } from '../../data';
import { cn } from '../../lib/cn';
import { ChevronDown, List } from 'lucide-react';


export const MobileToc = ({ content }: { content: string }) => {
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

export default MobileToc;
