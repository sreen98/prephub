import { Link } from 'react-router-dom';
import { Flag, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useCheckpoints } from '../hooks/useCheckpoints';
import EmptyNote, { NoteLink } from '../components/EmptyNote';

export default function CheckpointsPage() {
  const { checkpoints, clearCheckpoint, clearAll } = useCheckpoints();
  const entries = Object.entries(checkpoints).sort(
    ([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (entries.length === 0) {
    return (
      <EmptyNote Icon={Flag} title="No checkpoints yet" actions={<NoteLink to="/"><ArrowLeft size={16} /> Back home</NoteLink>}>
        While reading any guide, click the floating &ldquo;Save Checkpoint&rdquo; button to mark where you left off. Return later and one click takes you straight back.
      </EmptyNote>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="page-title">Checkpoints</h1>
          <p className="font-mono text-xs text-muted mt-2">{entries.length} saved checkpoint{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-red-200 dark:border-red-800 bg-surface text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      {/* One index card holds every checkpoint, newest first, on its ruled lines */}
      <div className="index-card px-5 pt-5 pb-2 sm:px-6">
        <p className="index-card-head pb-3 font-display text-xl font-semibold">Where you left off</p>
        <ul>
          {entries.map(([guidePath, cp]) => (
            <li key={guidePath} className="index-card-line flex items-center gap-3 py-3.5">
              <Flag size={16} className="text-accent shrink-0 fill-accent" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <span className="block font-mono text-xs text-muted">{cp.guideName}</span>
                <Link
                  to={`${guidePath}#${cp.headingId}`}
                  className="block font-medium hover:text-accent hover:underline decoration-accent/40 underline-offset-4 truncate"
                >
                  {cp.headingText}
                </Link>
                <span className="font-mono text-xs text-muted">
                  Saved {new Date(cp.createdAt).toLocaleDateString()} at {new Date(cp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <Link
                to={`${guidePath}#${cp.headingId}`}
                aria-label={`Continue ${cp.guideName} from ${cp.headingText}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
              >
                Continue <ArrowRight size={13} aria-hidden="true" />
              </Link>
              <button
                onClick={() => clearCheckpoint(guidePath)}
                className="p-1.5 rounded-md text-muted hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                aria-label={`Clear checkpoint for ${cp.guideName}`}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
