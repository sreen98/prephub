import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  BookOpen, Bookmark, BookmarkCheck, Check, CheckCircle, ChevronDown, Circle, Clock,
  Copy, ExternalLink, Flag, Link2, List, PanelLeftClose, PanelLeftOpen, Play, Tag, Timer, X,
} from 'lucide-react';
import { escapeRegex, readMinFor, estimatedHeightFor,
  loadContent, peekContent, menuStructure,
  type MenuItem, type MenuSection,
} from '../data';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCheckpoints } from '../hooks/useCheckpoints';
import { useProgress } from '../hooks/useProgress';
import { useStudyStats } from '../hooks/useStudyStats';
import MermaidBlock from '../components/MermaidBlock';
import Toast from '../components/Toast';
import { cn } from '../lib/cn';
import GuideSkeleton from '../features/content/GuideSkeleton';
import PreBlock from '../features/content/PreBlock';
import TableOfContents from '../features/content/TableOfContents';
import MobileToc from '../features/content/MobileToc';
import OfficialDocsBar from '../features/content/OfficialDocsBar';
import SaveCheckpointFab from '../features/content/SaveCheckpointFab';
import { findNearestHeadingAbove } from '../features/content/findNearestHeadingAbove';
import { stripMarkdownToc } from '../features/content/stripMarkdownToc';
import { buildMarkdownComponents } from '../features/content/markdownComponents';
import RelatedGuides from '../features/content/RelatedGuides';


// Extracted from App.tsx so the markdown pipeline (react-markdown + remark +
// rehype, ~327 KB as `vendor-markdown`) is no longer part of the entry chunk.
// It was eager purely because ContentPage lived in the entry module, so a
// visitor who only opened the home page — which renders no markdown at all —
// still downloaded all of it. This module is loaded with React.lazy.






export const ContentPage = ({ filePath, guidePath, guideName }: { filePath: string; guidePath?: string; guideName?: string }) => {
  // Content is lazy-loaded per guide (see data.ts) so the main bundle doesn't
  // carry all 68 of them. loadContent caches, so revisiting is instant and the
  // loading state only appears on a genuine first fetch.
  // Initialise from the cache when the guide has already been read, so a
  // revisit renders immediately rather than flashing the skeleton for a frame.
  const [rawContent, setRawContent] = useState<string | null>(() => peekContent(filePath) ?? null);
  useEffect(() => {
    let cancelled = false;
    const cached = peekContent(filePath);
    // Syncing to a changed `filePath`. The idiomatic fix is `key={filePath}` on
    // the route element so the component remounts; deferred because remounting
    // also resets the hash-scroll and reading-progress effects.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRawContent(cached ?? null);
    if (cached !== undefined) return;
    loadContent(filePath)
      .then((text) => {
        if (!cancelled) {
          setRawContent(text || '# Not Found\n\nThe requested content could not be found.');
        }
      })
      .catch((err: unknown) => {
        // Without this the promise rejected silently and `rawContent` stayed
        // null, so the skeleton spun forever. The usual cause is a chunk 404
        // after a deploy replaced the hashed files under an open tab.
        console.error('[prephub] failed to load guide', filePath, err);
        if (!cancelled) {
          setRawContent(
            '# Could not load this guide\n\nThe content failed to download. '
            + 'If a new version was just released, reload the page.',
          );
        }
      });
    return () => { cancelled = true; };
  }, [filePath]);
  const content = useMemo(() => stripMarkdownToc(rawContent ?? ''), [rawContent]);
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightCount, setHighlightCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);
  const { getStatus, markInProgress, toggleComplete } = useProgress();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getCheckpoint, setCheckpoint, clearCheckpoint } = useCheckpoints();
  const { recordGuideCompleted } = useStudyStats();
  const guideStatus = guidePath ? getStatus(guidePath) : null;
  const checkpoint = guidePath ? getCheckpoint(guidePath) : null;

  // Dynamic page title for SEO
  useEffect(() => {
    const pageTitle = guideName ? `${guideName} — PrepHub` : 'PrepHub — Interview Prep';
    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && guideName) {
      metaDesc.setAttribute('content', `${guideName} interview preparation guide — PrepHub`);
    }
    return () => { document.title = 'PrepHub — Interview Prep'; };
  }, [guideName]);

  // Hash-based scroll-to-heading on mount. The target does not exist when this
  // effect commits — ReactMarkdown renders the body afterwards, and a large
  // guide takes a while (the React one is ~280 KB with 149 headings and 199
  // syntax-highlighted code blocks). This previously polled a fixed 60 rAF
  // frames and gave up, so deep links from Checkpoints and Bookmarks silently
  // landed at the top of the page on the biggest guides — exactly the ones
  // where scrolling to the right place matters most.
  //
  // Three changes make it reliable:
  //   1. A wall-clock deadline instead of a frame count, so a slow render is
  //      tolerated rather than racing a budget that shrinks as guides grow.
  //   2. An instant jump rather than a smooth scroll — the page is still
  //      laying out code blocks, and a smooth scroll gets overtaken by the
  //      content shifting beneath it.
  //   3. One re-assert after layout settles, because highlighted code blocks
  //      change height as they render and push the target off-screen. It is
  //      abandoned the moment the user scrolls, so it can never yank them.
  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    let cancelled = false;
    let userScrolled = false;
    const deadline = performance.now() + 10_000;

    const onUserScroll = () => { userScrolled = true; };
    window.addEventListener('wheel', onUserScroll, { passive: true, once: true });
    window.addEventListener('touchstart', onUserScroll, { passive: true, once: true });
    window.addEventListener('keydown', onUserScroll, { once: true });

    let reassert: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        reassert = setTimeout(() => {
          if (!cancelled && !userScrolled) el.scrollIntoView({ block: 'start' });
        }, 400);
        return;
      }
      if (performance.now() < deadline) requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelled = true;
      if (reassert) clearTimeout(reassert);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchstart', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
    };
  }, [location.hash, content]);

  // ===== Feature 1: Related Guides Suggestions =====
  const relatedGuides = useMemo(() => {
    if (!guidePath) return [];
    // Find current category. Narrow to sections that have items so TS
    // knows the .items property is defined throughout this block.
    type CategoryWithItems = MenuSection & { items: MenuItem[] };
    const hasItems = (s: MenuSection): s is CategoryWithItems => Array.isArray(s.items);
    const categoriesWithItems: CategoryWithItems[] = menuStructure.filter(hasItems);
    let currentCategory: CategoryWithItems | null = null;
    let currentCategoryIndex = -1;
    for (let i = 0; i < categoriesWithItems.length; i++) {
      if (categoriesWithItems[i].items.some(item => item.path === guidePath)) {
        currentCategory = categoriesWithItems[i];
        currentCategoryIndex = i;
        break;
      }
    }
    if (!currentCategory) return [];

    // Get other guides from same category
    let related: MenuItem[] = currentCategory.items.filter(item => item.path !== guidePath);

    // If fewer than 2, pull from adjacent categories
    if (related.length < 2) {
      const adjacentIndices = [currentCategoryIndex - 1, currentCategoryIndex + 1].filter(
        i => i >= 0 && i < categoriesWithItems.length
      );
      for (const idx of adjacentIndices) {
        if (related.length >= 3) break;
        related = related.concat(categoriesWithItems[idx].items.slice(0, 3 - related.length));
      }
    }

    return related.slice(0, 3);
  }, [guidePath]);

  // Auto-mark in-progress on visit
  useEffect(() => {
    if (guidePath) markInProgress(guidePath);
  }, [guidePath, markInProgress]);

  const handleToggleComplete = () => {
    if (guidePath) {
      toggleComplete(guidePath);
      if (guideStatus !== 'completed') recordGuideCompleted();
    }
  };

  // Search highlighting
  useEffect(() => {
    if (!searchQuery || !containerRef.current) {
      // Paired with the DOM un-highlighting below; both belong in this effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlightCount(0);
      return;
    }

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi');
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const parent = node.parentElement;
        if (parent && !parent.closest('pre, code, .code-block, .code-block-header')) {
          textNodes.push(node);
        }
      }

      let count = 0;
      let firstMark: HTMLElement | null = null;

      for (const node of textNodes) {
        const text = node.textContent ?? '';
        if (regex.test(text)) {
          regex.lastIndex = 0;
          const span = document.createElement('span');
          span.innerHTML = text.replace(regex, '<mark class="search-hl">$1</mark>');
          node.parentNode?.replaceChild(span, node);
          const mark = span.querySelector('mark');
          if (mark && !firstMark) firstMark = mark;
          count += (text.match(regex) || []).length;
        }
      }

      setHighlightCount(count);

      if (firstMark) {
        const target = firstMark;
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
    }, 400);

    // Capture the node now: by cleanup time `containerRef.current` may already
    // be null (or a different element), so the un-highlight would silently skip.
    const container = containerRef.current;
    return () => {
      clearTimeout(timer);
      container?.querySelectorAll('mark.search-hl').forEach((m: Element) => {
        const parent = m.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(m.textContent ?? ''), m);
        parent.normalize();
      });
    };
  }, [searchQuery, filePath]);

  // The markdown renderer map lives in features/content/markdownComponents.
  const markdownComponents = useMemo(
    () => buildMarkdownComponents({
      guidePath, guideName, isBookmarked, toggleBookmark, onCopyLink: setToastMsg,
    }),
    [guidePath, guideName, isBookmarked, toggleBookmark],
  );

  return (
    <>
      <div
        key={filePath}
        className={cn("animate-rise-in px-6 py-8 md:px-12 md:py-12", !isTocCollapsed && "xl:mr-64")}
      >
        {/* Search highlight banner */}
        {searchQuery && highlightCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 mb-6 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/50 text-sm">
            <span className="text-yellow-800 dark:text-yellow-300">
              Found <strong>{highlightCount}</strong> match{highlightCount !== 1 ? 'es' : ''} for &ldquo;{searchQuery}&rdquo;
            </span>
            <Link
              to={location.pathname}
              className="text-yellow-600 dark:text-yellow-400 hover:underline text-xs font-medium"
            >
              Clear
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            ~{readMinFor(filePath)} min read
          </span>
          {guidePath && (
            <button
              onClick={handleToggleComplete}
              className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors", guideStatus === 'completed' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              {guideStatus === 'completed' ? <CheckCircle size={13} /> : <Circle size={13} />}
              {guideStatus === 'completed' ? 'Completed' : 'Mark Complete'}
            </button>
          )}
        </div>

        <OfficialDocsBar filePath={filePath} />

        {checkpoint && guidePath && (
          <div
            className="animate-drop-in flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50"
          >
            <Flag size={16} className="text-indigo-500 fill-indigo-500/30 shrink-0" />
            <button
              onClick={() => {
                const el = document.getElementById(checkpoint.headingId);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                else setToastMsg('Checkpoint heading no longer exists in this guide');
              }}
              className="flex-1 min-w-0 text-left text-sm group"
            >
              <span className="text-indigo-700 dark:text-indigo-300">Continue from </span>
              <span className="font-semibold text-indigo-900 dark:text-indigo-100 group-hover:underline truncate">
                &ldquo;{checkpoint.headingText}&rdquo;
              </span>
            </button>
            <button
              onClick={() => clearCheckpoint(guidePath)}
              className="p-1 rounded-lg text-indigo-500 dark:text-indigo-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shrink-0"
              aria-label="Clear checkpoint"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <MobileToc content={content} />

        {/* Reserve the guide's approximate height while it loads. Without this
            the container is skeleton-sized and then jumps to the real height,
            which Lighthouse measured as a single 0.72 layout shift on the React
            guide. The reservation is dropped the moment content arrives so it
            can never constrain the real layout. */}
        <div
          ref={containerRef}
          className="prose-container"
          style={rawContent === null ? { minHeight: estimatedHeightFor(filePath) } : undefined}
        >
          {rawContent === null ? <GuideSkeleton /> : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>)}
        </div>

        <RelatedGuides guides={relatedGuides} />
      </div>

      <TableOfContents content={content} isCollapsed={isTocCollapsed} onToggle={() => setIsTocCollapsed(c => !c)} />
      {guidePath && guideName && (
        <SaveCheckpointFab
          onSave={() => {
            const heading = findNearestHeadingAbove();
            if (!heading || !heading.id) {
              setToastMsg('No heading found to checkpoint');
              return;
            }
            setCheckpoint(guidePath, {
              headingId: heading.id,
              headingText: heading.text,
              guideName,
            });
            setToastMsg(`Checkpoint saved at "${heading.text}"`);
          }}
        />
      )}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </>
  );
};

export default ContentPage;
