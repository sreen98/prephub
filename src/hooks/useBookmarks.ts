import { useState, useCallback } from 'react';
import { getJSON, setJSON } from '../lib/storage';

const STORAGE_KEY = 'bookmarks' as const;

/**
 * A bookmark is one of two genuinely different things, so it's modelled as a
 * discriminated union rather than one bag with optional fields. It previously
 * carried `[key: string]: unknown`, which made every field `unknown` at the
 * call site — the consumer cast to `any[]` to compensate, and that cast was
 * hiding the fact that nothing about the shape was actually being checked.
 */
interface BookmarkBase {
  id: string;
  guideName?: string;
  createdAt?: string;
}

export interface HeadingBookmark extends BookmarkBase {
  type: 'heading';
  guidePath: string;
  headingId: string;
  headingText: string;
}

export interface QuizBookmark extends BookmarkBase {
  type: 'quiz';
  questionId: string;
  questionText: string;
}

export type Bookmark = HeadingBookmark | QuizBookmark;

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
  return getJSON(STORAGE_KEY, []);
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  const save = useCallback((next: Bookmark[]): void => {
    setJSON(STORAGE_KEY, next);
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
