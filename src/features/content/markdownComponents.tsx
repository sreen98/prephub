import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Components } from 'react-markdown';
import { slugify, getTextContent } from '../../data';
import { cn } from '../../lib/cn';
import MermaidBlock from '../../components/MermaidBlock';
import PreBlock from './PreBlock';
import { Link2, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Bookmark as BookmarkEntry } from '../../hooks/useBookmarks';

// The ReactMarkdown `components` map for a rendered guide.
//
// Extracted from ContentPage so that component's render function stays legible:
// the map plus the heading factory were 80+ lines inside a 380-line return, and
// together they pushed the file over the size limit. It is a factory rather
// than a constant because headings need the page's bookmark state.

export interface MarkdownComponentOptions {
  guidePath?: string;
  guideName?: string;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (b: BookmarkEntry) => void;
  onCopyLink: (message: string) => void;
}

/** Builds the heading renderer for one level, with anchor + bookmark buttons. */
function createHeading(level: number, opts: MarkdownComponentOptions) {
  const { guidePath, guideName, isBookmarked, toggleBookmark, onCopyLink } = opts;
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const HeadingComponent: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => {
    const text = getTextContent(children);
    const id = slugify(text);
    const bookmarkId = guidePath ? `${guidePath.replace(/\//g, '-').slice(1)}__${id}` : null;
    const isMarked = bookmarkId ? isBookmarked(bookmarkId) : false;

    return (
      <Tag id={id} className="group relative" {...props}>
        {children}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const url = `${window.location.origin}${window.location.pathname}#${id}`;
            navigator.clipboard.writeText(url)
              .then(() => onCopyLink('Link copied!'))
              .catch(() => onCopyLink('Could not copy the link'));
          }}
          className="heading-anchor"
          aria-label="Copy link"
        >
          <Link2 size={level <= 2 ? 20 : 18} />
        </button>
        {bookmarkId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark({
                id: bookmarkId, guidePath: guidePath ?? '', guideName: guideName ?? '',
                headingId: id, headingText: text, type: 'heading',
              });
            }}
            className={cn('heading-bookmark', isMarked && 'bookmarked')}
            aria-label={isMarked ? 'Remove bookmark' : 'Bookmark section'}
          >
            {isMarked ? <BookmarkCheck size={level <= 2 ? 20 : 18} /> : <Bookmark size={level <= 2 ? 20 : 18} />}
          </button>
        )}
      </Tag>
    );
  };
  return HeadingComponent;
}

export function buildMarkdownComponents(opts: MarkdownComponentOptions): Components {
  return {
    h1: createHeading(1, opts),
    h2: createHeading(2, opts),
    h3: createHeading(3, opts),
    h4: createHeading(4, opts),
    pre({ children }) {
      // ```mermaid blocks go to the lazy diagram renderer, not the code block.
      const child = React.Children.toArray(children)[0];
      if (
        React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)
        && child.props?.className?.includes('language-mermaid')
      ) {
        const code = typeof child.props.children === 'string' ? child.props.children : '';
        return <MermaidBlock chart={code} />;
      }
      return <PreBlock>{children}</PreBlock>;
    },
    code({ className, children, ...props }) {
      if (className?.includes('language-') || className?.includes('hljs')) {
        return <code className={className} {...props}>{children}</code>;
      }
      return <code className="inline-code" {...props}>{children}</code>;
    },
    table({ children }) {
      // Wide tables scroll inside their own container so the page never does.
      return (
        <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <table>{children}</table>
        </div>
      );
    },
    a({ href, children, ...props }) {
      const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
      return (
        <a
          href={href}
          className="content-link"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...props}
        >
          {children}
          {isExternal && <ExternalLink size={12} className="inline ml-1 -mt-0.5" />}
        </a>
      );
    },
  };
}
