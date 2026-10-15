import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';
import { useBookmarks, type BookmarksByGuide } from '../hooks/useBookmarks';
import EmptyNote, { NoteLink } from '../components/EmptyNote';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, clearAll, getByGuide } = useBookmarks();
  const grouped: BookmarksByGuide = getByGuide();
  const guideNames: string[] = Object.keys(grouped);

  if (bookmarks.length === 0) {
    return (
      <EmptyNote Icon={Bookmark} title="No bookmarks yet" actions={<NoteLink to="/"><ArrowLeft size={16} /> Back home</NoteLink>}>
        Click the bookmark icon on any heading while reading a guide, or bookmark quiz questions to save them here.
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
          <h1 className="page-title">Bookmarks</h1>
          <p className="font-mono text-xs text-muted mt-2">{bookmarks.length} saved item{bookmarks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-red-200 dark:border-red-800 bg-surface text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      {/* One index card per guide, its bookmarks on the ruled lines */}
      {guideNames.map((guideName: string) => (
        <section key={guideName} className="index-card mb-6 px-5 pt-5 pb-2 sm:px-6" aria-label={guideName}>
          <h2 className="index-card-head pb-3 font-display text-xl font-semibold">{guideName}</h2>
          <ul>
            {grouped[guideName].map((bookmark) => (
              <li key={bookmark.id} className="index-card-line flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <Link
                    to={bookmark.type === 'heading' ? `${bookmark.guidePath}#${bookmark.headingId}` : '/quiz'}
                    className="font-medium hover:text-accent hover:underline decoration-accent/40 underline-offset-4 block truncate"
                  >
                    {bookmark.type === 'heading' ? bookmark.headingText : bookmark.questionText}
                  </Link>
                  <span className="font-mono text-xs text-muted">
                    {bookmark.type === 'heading' ? 'Section' : 'Quiz question'}
                    {bookmark.createdAt && ` · ${new Date(bookmark.createdAt).toLocaleDateString()}`}
                  </span>
                </div>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  aria-label={`Remove bookmark: ${bookmark.type === 'quiz' ? bookmark.questionText : bookmark.headingText}`}
                  className="p-1.5 rounded-md text-muted hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
