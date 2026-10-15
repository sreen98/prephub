import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-[3px] bg-ink text-canvas text-sm font-medium shadow-[0_14px_24px_-14px_rgb(0_0_0/0.5)] flex items-center gap-2"
        >
          {/* The chip is ink-coloured: near-black in light mode, cream in dark. */}
          <Check size={14} aria-hidden="true" className="text-emerald-400 dark:text-emerald-700" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
