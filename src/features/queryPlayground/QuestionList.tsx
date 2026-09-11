import { CheckCircle2, Circle, Database, Leaf } from 'lucide-react';
import type { QueryQuestion, QueryEngine } from '../../data/queries/types';
import { cn } from '../../lib/cn';

const DIFF_TONE: Record<string, string> = {
  Easy: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/30',
  Medium: 'text-amber-400 border-amber-800/60 bg-amber-950/30',
  Hard: 'text-rose-400 border-rose-800/60 bg-rose-950/30',
};

export default function QuestionList({
  questions, selectedId, solvedIds, engine, onEngineChange, onSelect,
}: {
  questions: QueryQuestion[];
  selectedId: string | null;
  solvedIds: Set<string>;
  engine: QueryEngine;
  onEngineChange: (e: QueryEngine) => void;
  onSelect: (q: QueryQuestion) => void;
}) {
  const inScope = questions.filter((q) => q.engine === engine);
  const solvedInScope = inScope.filter((q) => solvedIds.has(q.id)).length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-[#2d333b] shrink-0">
        <div className="flex items-center gap-1 bg-[#1c2028] rounded-xl p-0.5 mb-2">
          {([
            { id: 'postgres' as const, label: 'PostgreSQL', Icon: Database },
            { id: 'mongo' as const, label: 'MongoDB', Icon: Leaf },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onEngineChange(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                engine === id
                  ? 'bg-[#2d333b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          {solvedInScope} / {inScope.length} solved
        </p>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll p-2 space-y-1">
        {inScope.map((q) => {
          const isSolved = solvedIds.has(q.id);
          const isActive = q.id === selectedId;
          return (
            <button
              key={q.id}
              onClick={() => onSelect(q)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors border',
                isActive
                  ? 'bg-indigo-950/40 border-indigo-700/60'
                  : 'border-transparent hover:bg-[#2d333b]/60',
              )}
            >
              <div className="flex items-start gap-2">
                {isSolved
                  ? <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  : <Circle size={14} className="text-slate-600 mt-0.5 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className={cn('text-[13px] font-medium truncate', isActive ? 'text-white' : 'text-slate-300')}>
                    {q.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', DIFF_TONE[q.difficulty])}>
                      {q.difficulty}
                    </span>
                    {q.topics.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#2d333b] text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
