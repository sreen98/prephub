import type { ResultRow } from '../../data/queries/types';

/** Renders a cell the way a database client would, not the way JSON.stringify does. */
function renderCell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  // Arrays and objects (jsonb, $group _id documents) print as compact JSON.
  return JSON.stringify(value) ?? String(typeof value);
}

export default function ResultTable({
  rows, columns, emptyMessage = 'No rows.',
}: {
  rows: ResultRow[];
  columns: string[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400 italic px-4 py-3">{emptyMessage}</p>;
  }
  const cols = columns.length > 0 ? columns : [...new Set(rows.flatMap((r) => Object.keys(r)))];

  return (
    // Wide result sets scroll inside their own container so the page never does.
    <div className="overflow-auto max-h-full">
      <table className="w-full text-left border-collapse text-[13px]">
        <thead className="sticky top-0 bg-[#22272e] z-10">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold text-slate-300 border-b border-[#3d444d] whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#2d333b] last:border-0 hover:bg-[#2d333b]/40">
              {cols.map((c) => {
                const v = row[c];
                return (
                  <td
                    key={c}
                    className={
                      'px-3 py-1.5 whitespace-nowrap '
                      + (v === null || v === undefined ? 'text-slate-600 italic' : 'text-slate-200')
                    }
                  >
                    {renderCell(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
