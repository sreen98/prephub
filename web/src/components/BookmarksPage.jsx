import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookmarks } from '../hooks/useBookmarks';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, clearAll, getByGuide } = useBookmarks();
  const grouped = getByGuide();
  const guideNames = Object.keys(grouped);

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Bookmark size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Bookmarks Yet</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          Click the bookmark icon on any heading while reading a guide, or bookmark quiz questions to save them here.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={16} /> Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold">Bookmarks</h1>
          <p className="text-sm text-slate-500 mt-1">{bookmarks.length} saved item{bookmarks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      {guideNames.map(guideName => (
        <motion.div
          key={guideName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
            {guideName}
          </h3>
          <div className="space-y-1.5">
            {grouped[guideName].map(bookmark => (
              <div
                key={bookmark.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              >
                <Bookmark size={14} className="text-indigo-500 shrink-0 fill-indigo-500" />
                <div className="flex-1 min-w-0">
                  <Link
                    to={bookmark.type === 'heading' ? `${bookmark.guidePath}#${bookmark.headingId}` : '/quiz'}
                    className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    {bookmark.type === 'heading' ? bookmark.headingText : bookmark.questionText}
                  </Link>
                  <span className="text-[11px] text-slate-400">
                    {bookmark.type === 'heading' ? 'Section' : 'Quiz Question'}
                    {bookmark.createdAt && ` · ${new Date(bookmark.createdAt).toLocaleDateString()}`}
                  </span>
                </div>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all"
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
