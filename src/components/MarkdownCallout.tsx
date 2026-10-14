import React, { type ReactNode } from 'react';
import { Info, KeyRound, Lightbulb, MessageCircleQuestion, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react';
import { parseCalloutMarker, type CalloutKind } from '../lib/callouts';

// Renders `> [!KIND]` blockquotes as callout cards (syntax in lib/callouts.ts).
// A blockquote without a known marker renders as a plain quote, unchanged.
// Shared by the guide page and by Quiz, Review and the Interview Simulator,
// which render the same answers.

const KIND_META: Record<CalloutKind, { label: string; Icon: LucideIcon }> = {
  FOLLOWUP: { label: 'Interviewer follow-up', Icon: MessageCircleQuestion },
  TRAP: { label: 'Common trap', Icon: OctagonAlert },
  KEY: { label: 'Say this in the interview', Icon: KeyRound },
  NOTE: { label: 'Note', Icon: Info },
  TIP: { label: 'Tip', Icon: Lightbulb },
  WARNING: { label: 'Warning', Icon: TriangleAlert },
};

type ParagraphElement = React.ReactElement<{ children?: ReactNode }>;

/** Strips the marker from the first paragraph and returns the kind plus the remaining blocks. */
function splitCallout(children: ReactNode): { kind: CalloutKind; blocks: ReactNode[] } | null {
  // Between block elements react-markdown leaves "\n" strings; only the elements matter.
  const blocks = React.Children.toArray(children).filter((c): c is ParagraphElement => React.isValidElement(c));
  const first = blocks[0];
  if (!first || first.type !== 'p') return null;
  const parts = React.Children.toArray(first.props.children);
  if (typeof parts[0] !== 'string') return null;
  const parsed = parseCalloutMarker(parts[0]);
  if (!parsed) return null;
  const rest = parsed.rest ? [parsed.rest, ...parts.slice(1)] : parts.slice(1);
  // A marker on a line of its own leaves an empty first paragraph: drop it.
  const firstBlock = rest.length ? React.cloneElement(first, undefined, ...rest) : null;
  return { kind: parsed.kind, blocks: firstBlock ? [firstBlock, ...blocks.slice(1)] : blocks.slice(1) };
}

export function CalloutBlockquote({ children }: { children?: ReactNode }) {
  const callout = splitCallout(children);
  if (!callout) return <blockquote>{children}</blockquote>;
  const { kind, blocks } = callout;
  const { label, Icon } = KIND_META[kind];
  const heading = (
    <p className="callout-label">
      <Icon size={16} aria-hidden="true" />
      {label}
    </p>
  );

  if (kind === 'FOLLOWUP') {
    // The first paragraph is the question; the answer stays folded so the reader
    // tries it first. <details> keeps it findable with Ctrl+F and works in print.
    const [question, ...answer] = blocks;
    return (
      <aside className="callout callout-followup" aria-label={label}>
        {heading}
        <div className="callout-question">{question}</div>
        {answer.length > 0 && (
          <details className="callout-reveal">
            <summary>
              <span className="when-closed">Think of your answer, then reveal</span>
              <span className="when-open">Hide answer</span>
            </summary>
            <div className="callout-answer">{answer}</div>
          </details>
        )}
      </aside>
    );
  }

  return (
    <aside className={`callout callout-${kind.toLowerCase()}`} aria-label={label}>
      {heading}
      <div className="callout-body">{blocks}</div>
    </aside>
  );
}

