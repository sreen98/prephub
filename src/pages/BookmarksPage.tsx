import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookmarks, type BookmarksByGuide } from '../hooks/useBookmarks';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, clearAll, getByGuide } = useBookmarks();
  const grouped: BookmarksByGuide = getByGuide();
  const guideNames: string[] = Object.keys(grouped);

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Bookmark size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Bookmarks Yet</h2>
        <p className="text-muted mb-6 max-w-md">
          Click the bookmark icon on any heading while reading a guide, or bookmark quiz questions to save them here.
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
          <h1 className="text-2xl font-extrabold">Bookmarks</h1>
          <p className="text-sm text-muted mt-1">{bookmarks.length} saved item{bookmarks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      {guideNames.map((guideName: string) => (
        <motion.div
          key={guideName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3 px-1">
            {guideName}
          </h3>
          <div className="space-y-1.5">
            {grouped[guideName].map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center gap-3 px-4 py-3 rounded-md bg-surface border border-line group hover:border-accent/30 transition-colors"
              >
                <Bookmark size={14} className="text-accent shrink-0 fill-accent" />
                <div className="flex-1 min-w-0">
                  <Link
                    to={bookmark.type === 'heading' ? `${bookmark.guidePath}#${bookmark.headingId}` : '/quiz'}
                    className="text-sm font-medium hover:text-accent-strong transition-colors block truncate"
                  >
                    {bookmark.type === 'heading' ? bookmark.headingText : bookmark.questionText}
                  </Link>
                  <span className="text-[11px] text-muted">
                    {bookmark.type === 'heading' ? 'Section' : 'Quiz Question'}
                    {bookmark.createdAt && ` \u00B7 ${new Date(bookmark.createdAt).toLocaleDateString()}`}
                  </span>
                </div>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  aria-label={`Remove bookmark: ${bookmark.type === 'quiz' ? bookmark.questionText : bookmark.headingText}`}
                  className="p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
