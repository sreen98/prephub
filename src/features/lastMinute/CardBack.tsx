import { Fragment } from 'react';
import { AlertTriangle, MessageSquareQuote } from 'lucide-react';
import type { CardCode, CardLang, LastMinuteCard } from '../../data/lastMinuteCards';
import { parseInline, type InlineToken } from '../../lib/inlineMarkup';
import { highlightCode } from '../../lib/cardHighlight';

function Tokens({ tokens }: { tokens: InlineToken[] }) {
  return tokens.map((t, i) => {
    if (t.kind === 'code') return <code key={i} className="rounded bg-ink/10 px-1 py-px font-mono text-[0.88em]">{t.value}</code>;
    if (t.kind === 'bold') return <strong key={i} className="font-semibold"><Tokens tokens={t.children} /></strong>;
    return <Fragment key={i}>{t.value}</Fragment>;
  });
}

/** Card text with `code` and **bold**; the only markup the cards use. */
export function InlineText({ text }: { text: string }) {
  return <Tokens tokens={parseInline(text)} />;
}

const HLJS_LANG: Record<Exclude<CardLang, 'text'>, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', css: 'css', html: 'xml',
};

function CodeSample({ code }: { code: CardCode }) {
  // Always dark like every code block on the site; long lines scroll inside the card.
  // The background sits on a wrapper because .code-block-body forces its own to transparent.
  return (
    <div className="rounded-lg bg-[#22272e] text-[#adbac7]">
      <pre className="code-block-body !p-3 sm:!p-4">
        {code.lang === 'text'
          ? <code>{code.source}</code>
          : <code className="hljs" dangerouslySetInnerHTML={{ __html: highlightCode(code.source, HLJS_LANG[code.lang]) }} />}
      </pre>
    </div>
  );
}

function CardTableView({ table }: { table: NonNullable<LastMinuteCard['table']> }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-left text-[13px] leading-snug">
        <thead className="bg-ink/5">
          <tr>{table.head.map(h => <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr key={row[0]} className="border-t border-line align-top">
              {row.map((cell, i) => i === 0
                ? <th key={i} scope="row" className="px-3 py-2 font-medium whitespace-nowrap"><InlineText text={cell} /></th>
                : <td key={i} className="px-3 py-2"><InlineText text={cell} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The answer side of a card, in a fixed order: answer, table, code, points, watch-out, what to say. */
export default function CardBack({ card }: { card: LastMinuteCard }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed">
      <p><InlineText text={card.answer} /></p>
      {card.table && <CardTableView table={card.table} />}
      {card.code && <CodeSample code={card.code} />}
      {card.points && (
        <ul className="list-disc pl-5 space-y-1.5">
          {card.points.map(p => <li key={p}><InlineText text={p} /></li>)}
        </ul>
      )}
      {card.watch && (
        <p className="flex gap-2 rounded-lg bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 px-3 py-2.5 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span><span className="sr-only">Watch out: </span><InlineText text={card.watch} /></span>
        </p>
      )}
      {card.say && (
        <p className="flex gap-2 rounded-lg bg-accent-soft text-ink px-3 py-2.5 text-sm">
          <MessageSquareQuote size={16} className="shrink-0 mt-0.5 text-accent" aria-hidden="true" />
          <span><span className="font-semibold">Say it: </span><InlineText text={card.say} /></span>
        </p>
      )}
    </div>
  );
}
