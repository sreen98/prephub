import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bookmarks';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(load);

  const save = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setBookmarks(next);
  }, []);

  const isBookmarked = useCallback((id) => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  const addBookmark = useCallback((bookmark) => {
    const current = load();
    if (current.some(b => b.id === bookmark.id)) return;
    save([...current, { ...bookmark, createdAt: new Date().toISOString() }]);
  }, [save]);

  const removeBookmark = useCallback((id) => {
    save(load().filter(b => b.id !== id));
  }, [save]);

  const toggleBookmark = useCallback((bookmark) => {
    const current = load();
    if (current.some(b => b.id === bookmark.id)) {
      save(current.filter(b => b.id !== bookmark.id));
    } else {
      save([...current, { ...bookmark, createdAt: new Date().toISOString() }]);
    }
  }, [save]);

  const getByGuide = useCallback(() => {
    const grouped = {};
    for (const b of bookmarks) {
      const key = b.guideName || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(b);
    }
    return grouped;
  }, [bookmarks]);

  const clearAll = useCallback(() => save([]), [save]);

  return { bookmarks, isBookmarked, addBookmark, removeBookmark, toggleBookmark, getByGuide, clearAll };
}
