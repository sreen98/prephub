import { Database, Table2 } from 'lucide-react';
import type { SqlDataset, MongoDataset } from '../../data/queries/types';

/**
 * Shows the shape of the data before you write anything. The datasets are
 * small on purpose — you can reason about the right answer by reading this
 * panel rather than guessing and running.
 */
export default function SchemaPanel({
  sql, mongo,
}: {
  sql?: SqlDataset;
  mongo?: MongoDataset;
}) {
  return (
    <div className="text-[13px] text-slate-300 space-y-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Database size={13} />
        <span className="font-semibold">{sql?.name ?? mongo?.name}</span>
      </div>

      {sql?.tables.map((table) => (
        <div key={table.name}>
          <div className="flex items-center gap-1.5 font-mono font-semibold text-indigo-300 mb-1">
            <Table2 size={12} /> {table.name}
          </div>
          <ul className="pl-5 space-y-0.5 font-mono text-[12px] text-slate-400">
            {table.columns.map((c) => <li key={c}>{c}</li>)}
          </ul>
          {table.note && <p className="pl-5 mt-1 text-[11px] text-slate-500 italic">{table.note}</p>}
        </div>
      ))}

      {mongo && Object.entries(mongo.collections).map(([name, docs]) => (
        <div key={name}>
          <div className="flex items-center gap-1.5 font-mono font-semibold text-emerald-300 mb-1">
            <Table2 size={12} /> {name}
            <span className="text-slate-500 font-sans font-normal">({docs.length} docs)</span>
          </div>
          <pre className="pl-2 text-[11px] text-slate-400 overflow-x-auto bg-[#1c2028] rounded-lg p-2 border border-[#2d333b]">
            {JSON.stringify(docs[0], null, 2)}
          </pre>
          <p className="pl-2 mt-1 text-[11px] text-slate-500 italic">First document shown — the rest share this shape.</p>
        </div>
      ))}
    </div>
  );
}
