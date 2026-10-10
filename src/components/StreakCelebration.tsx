import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/** Streak lengths worth marking. Any other value renders nothing. */
const MILESTONES = new Set([3, 7, 14, 30, 60, 100, 365]);

/** A plain sentence for the milestone; the number is the news, so the copy stays calm. */
function describe(days: number): string {
  if (days === 7) return 'You have studied every day for a week.';
  if (days === 30) return 'You have studied every day for a month.';
  if (days === 365) return 'You have studied every day for a year.';
  return `You have studied ${days} days in a row.`;
}

interface StreakCelebrationProps {
  milestone: number | null;
  onClose: () => void;
}

export default function StreakCelebration({ milestone, onClose }: StreakCelebrationProps) {
  if (!milestone || !MILESTONES.has(milestone)) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[300]"
        onClick={onClose}
      />
      <motion.div
        key="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-80 max-w-[90vw]"
      >
        <div className="relative bg-surface rounded-md p-7 border border-line shadow-xl text-ink">
          <button onClick={onClose} aria-label="Dismiss" className="absolute top-3 right-3 p-1.5 rounded-md text-muted hover:text-ink hover:bg-ink/5 transition-colors">
            <X size={16} />
          </button>

          <p className="text-4xl font-bold tabular-nums text-accent mb-1">{milestone}</p>
          <h2 id="streak-title" className="text-lg font-bold mb-2">day streak</h2>
          <p className="text-muted text-sm mb-6">
            {describe(milestone)} Your review schedule keeps bringing back the questions you found hard.
          </p>

          <button
            onClick={onClose}
            autoFocus
            className="px-5 py-2 rounded-md bg-accent text-accent-contrast font-medium text-sm hover:bg-accent-strong transition-colors"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
