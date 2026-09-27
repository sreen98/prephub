import type { ReactNode } from 'react';

// Explanation text (intuitions, step details, notes, tradeoffs, build-step
// prose) is written with a small subset of markdown: blank-line paragraphs,
// "•", "-" or "1." list lines, **bold**, *italic* and `code`. Rendered as a
// plain string it shows the asterisks and runs every paragraph together, so
// every text field in the Explain modals goes through here.

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|(?<![\w*])\*(?![\s*])[^*\n]+?(?<![\s*])\*(?![\w*]))/;
const BULLET = /^\s*(?:•|-|\d+\.)\s+/;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={i} className="font-mono text-[0.92em] px-1 py-px rounded bg-slate-200/70 dark:bg-slate-800">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/** **bold**, *italic* and `code` inside one line of text (a title, a heading). */
export function InlineText({ text }: { text: string }) {
  return <>{inline(text)}</>;
}

type Block = { kind: 'p' | 'ul' | 'ol'; lines: string[] };

function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of text.split(/\n{2,}/)) {
    const start = blocks.length;   // a blank line always starts a new block
    for (const line of chunk.split('\n')) {
      if (!line.trim()) continue;
      const bullet = BULLET.test(line);
      const kind = !bullet ? 'p' : /^\s*\d+\./.test(line) ? 'ol' : 'ul';
      const text = bullet ? line.replace(BULLET, '') : line;
      const prev = blocks.length > start ? blocks[blocks.length - 1] : undefined;
      if (prev?.kind === kind) prev.lines.push(text);
      else blocks.push({ kind, lines: [text] });
    }
  }
  return blocks;
}

/** A multi-paragraph text field. `className` styles the wrapper (size, colour, leading). */
export default function RichText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = toBlocks(text);
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((b, i) => {
        if (b.kind === 'p') return <p key={i}>{inline(b.lines.join(' '))}</p>;
        const items = b.lines.map((it, j) => <li key={j}>{inline(it)}</li>);
        return b.kind === 'ol'
          ? <ol key={i} className="list-decimal pl-5 space-y-0.5">{items}</ol>
          : <ul key={i} className="list-disc pl-5 space-y-0.5">{items}</ul>;
      })}
    </div>
  );
}
