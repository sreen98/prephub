import { ChevronRight } from 'lucide-react';
import type { TemplateLang, BlankStarter } from '../../data/playground/playgroundTemplates';

// The "Blank" tab of the template picker: three tiny language scaffolds.
// Their code ships eagerly with the index, so picking one needs no fetch.

export default function BlankStarterList({
  onPick, starters,
}: {
  onPick: (s: { name: string; lang: TemplateLang; code: string }) => void;
  /** The current playground's starters: JS and TS, or React. */
  starters: BlankStarter[];
}) {
  const handleBlankStarter = onPick;
  return (
    <div className="flex-1 overflow-auto p-8 bg-canvas">
      <p className="text-sm text-muted mb-6 max-w-xl">
        Pick a language and start from a minimal scaffold you can run and edit.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {starters.map((starter) => {
          const isReact = starter.lang === 'jsx' || starter.lang === 'tsx';
          return (
            <button
              key={starter.name}
              onClick={() => handleBlankStarter(starter)}
              className="group text-left p-5 rounded-md border border-line bg-surface hover:border-accent transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={
                  'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ' +
                  (isReact
                    ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : starter.lang === 'ts'
                      ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300')
                }>
                  {starter.lang.toUpperCase()}
                </span>
                <span className="font-semibold text-base">{starter.name}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{starter.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start <ChevronRight size={11} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
