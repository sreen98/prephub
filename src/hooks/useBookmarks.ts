import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bookmarks' as const;

export interface Bookmark {
  id: string;
  guideName?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface BookmarksByGuide {
  [guideName: string]: Bookmark[];
}

export interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  isBookmarked: (id: string) => boolean;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  toggleBookmark: (bookmark: Bookmark) => void;
  getByGuide: () => BookmarksByGuide;
  clearAll: () => void;
}

function load(): Bookmark[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || []; }
  catch { return []; }
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  const save = useCallback((next: Bookmark[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setBookmarks(next);
  }, []);

  const isBookmarked = useCallback((id: string): boolean => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  const addBookmark = useCallback((bookmark: Bookmark): void => {
    const current = load();
    if (current.some(b => b.id === bookmark.id)) return;
    save([...current, { ...bookmark, createdAt: new Date().toISOString() }]);
  }, [save]);

  const removeBookmark = useCallback((id: string): void => {
    save(load().filter(b => b.id !== id));
  }, [save]);

  const toggleBookmark = useCallback((bookmark: Bookmark): void => {
    const current = load();
    if (current.some(b => b.id === bookmark.id)) {
      save(current.filter(b => b.id !== bookmark.id));
    } else {
      save([...current, { ...bookmark, createdAt: new Date().toISOString() }]);
    }
  }, [save]);

  const getByGuide = useCallback((): BookmarksByGuide => {
    const grouped: BookmarksByGuide = {};
    for (const b of bookmarks) {
      const key = b.guideName || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(b);
    }
    return grouped;
  }, [bookmarks]);

  const clearAll = useCallback((): void => save([]), [save]);

  return { bookmarks, isBookmarked, addBookmark, removeBookmark, toggleBookmark, getByGuide, clearAll };
}
