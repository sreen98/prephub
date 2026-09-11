import { CheckCircle2, XCircle, Download } from 'lucide-react';
import type { SqlDataset, MongoDataset } from '../../data/queries/types';
import type { QueryRunResult } from './engines/postgres';
import type { CheckResult } from './checkAnswer';
import ResultTable from './ResultTable';
import SchemaPanel from './SchemaPanel';
import { cn } from '../../lib/cn';

/**
 * Everything on the right of the editor: the engine-download notice, the
 * verdict banner, the error, the result grid, and — before the first run —
 * the schema so you can work out the answer without running anything.
 *
 * Extracted from QueryPlayground because these five mutually-exclusive states
 * pushed that component's complexity past the limit on their own.
 */
export default function ResultPane({
  result, check, engineLoading, sqlDs, mongoDs,
}: {
  result: QueryRunResult | null;
  check: CheckResult | null;
  engineLoading: boolean;
  sqlDs?: SqlDataset;
  mongoDs?: MongoDataset;
}) {
  if (engineLoading) {
    return (
      <div className="p-4 flex items-start gap-3 text-sm text-slate-300">
        <Download size={16} className="mt-0.5 shrink-0 animate-pulse text-indigo-400" />
        <div>
          <p className="font-medium">Downloading PostgreSQL…</p>
          <p className="text-slate-500 text-[13px] mt-1">
            This runs a real PostgreSQL build in your browser, so the first query fetches
            about 5 MB. It is cached after that, and every later query is instant.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4 text-sm text-slate-500">
        <p>Write your query, then press <strong className="text-slate-300">Run &amp; check</strong>.</p>
        <div className="mt-5 pt-4 border-t border-[#2d333b]">
          <SchemaPanel sql={sqlDs} mongo={mongoDs} />
        </div>
      </div>
    );
  }

  return (
    <>
      {check && (
        <div className={cn(
          'mx-3 mt-3 px-3 py-2.5 rounded-xl border text-sm flex items-start gap-2',
          check.correct
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : 'bg-amber-950/40 border-amber-800/60 text-amber-300',
        )}>
          {check.correct
            ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            : <XCircle size={15} className="mt-0.5 shrink-0" />}
          <span>{check.reason}</span>
        </div>
      )}

      {result.error ? (
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl border bg-rose-950/40 border-rose-800/60 text-rose-300 text-sm font-mono">
          {result.error}
        </div>
      ) : (
        <div className="mt-3">
          <ResultTable rows={result.rows} columns={result.columns} />
        </div>
      )}
    </>
  );
}
