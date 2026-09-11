import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Check, Flag } from 'lucide-react';



export const SaveCheckpointFab = ({ onSave }: { onSave: () => void }) => {
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
export default SaveCheckpointFab;
