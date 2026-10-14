import type { Components } from 'react-markdown';
import { CalloutBlockquote } from './MarkdownCallout';

/**
 * A stable components map for pages that render answers with plain ReactMarkdown
 * (Quiz, Review, the Interview Simulator), so `> [!FOLLOWUP]` callouts look the same
 * there as in the guide. Kept out of MarkdownCallout.tsx, which may export only components.
 */
export const calloutComponents: Components = { blockquote: CalloutBlockquote };
