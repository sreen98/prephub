import React from 'react';
import { Link } from 'react-router-dom';
import { Flag, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCheckpoints } from '../hooks/useCheckpoints';

export default function CheckpointsPage() {
  const { checkpoints, clearCheckpoint, clearAll } = useCheckpoints();
  const entries = Object.entries(checkpoints).sort(
    ([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Flag size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Checkpoints Yet</h2>
        <p className="text-muted mb-6 max-w-md">
          While reading any guide, click the floating &ldquo;Save Checkpoint&rdquo; button to mark where you left off. Return later and one click takes you straight back.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ink/5 text-sm font-medium hover:bg-ink/10 transition-colors">
          <ArrowLeft size={16} /> Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold">Checkpoints</h1>
          <p className="text-sm text-muted mt-1">{entries.length} saved checkpoint{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      <div className="space-y-2">
        {entries.map(([guidePath, cp], idx) => (
          <motion.div
            key={guidePath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-md bg-surface border border-line group hover:border-accent/30 transition-colors"
          >
            <Flag size={16} className="text-accent shrink-0 fill-accent" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                {cp.guideName}
              </span>
              <Link
                to={`${guidePath}#${cp.headingId}`}
                className="block text-sm font-medium hover:text-accent-strong transition-colors truncate"
              >
                {cp.headingText}
              </Link>
              <span className="text-[11px] text-muted">
                Saved {new Date(cp.createdAt).toLocaleDateString()} at {new Date(cp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <Link
              to={`${guidePath}#${cp.headingId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-soft text-accent hover:bg-accent/20 transition-colors"
            >
              Continue <ArrowRight size={12} />
            </Link>
            <button
              onClick={() => clearCheckpoint(guidePath)}
              className="p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all"
              aria-label={`Clear checkpoint for ${cp.guideName}`}
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
