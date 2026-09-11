import React from 'react';
import type {
  ExplanationStep, Approach, ArrayCell, MapEntry, StackSnapshot, SetSnapshot,
  DualArraySnapshot, CallStackSnapshot, LinkedListSnapshot, TimelineSnapshot,
} from '../../../data/playground/playgroundExplanations';

// The visual canvas of the Explain modal: one small renderer per snapshot
// kind (array, hash map, stack, set, two-array merge, call stack, linked list,
// timeline). They are pure presentational components with no state, and they
// were 300+ of ExplanationModal's 638 lines — the modal itself is the step
// navigator and only picks which of these to render.
//
// `key={i}` throughout is deliberate and correct here: these cells are
// positional, re-derived per step, and hold no local state, so the index IS
// the identity.

export function ComplexityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-xs py-0.5">
      <span className="text-slate-500">{label}</span>
      <code className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{value}</code>
    </div>
  );
}

export function ArrayView({ array }: { array: NonNullable<ExplanationStep['array']> }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Array</div>
      <div className="flex gap-1.5 flex-wrap">
        {array.cells.map((cell, i) => (
          <CellView key={i} index={i} cell={cell} />
        ))}
      </div>
      {array.pointers && array.pointers.length > 0 && (
        <div className="flex gap-1.5 mt-1 flex-wrap" aria-hidden>
          {array.cells.map((_, i) => {
            const ps = array.pointers!.filter(p => p.index === i);
            return (
              <div key={i} className="w-12 flex flex-col items-center gap-0.5 min-h-[1.5rem]">
                {ps.map((p, k) => (
                  <span key={k} className={
                    'text-[10px] font-bold ' +
                    (p.color === 'red' ? 'text-red-500'
                      : p.color === 'amber' ? 'text-amber-500'
                      : p.color === 'emerald' ? 'text-emerald-500'
                      : 'text-indigo-500')
                  }>↑ {p.label}</span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CellView({ index, cell }: { index: number; cell: ArrayCell }) {
  const baseRing = 'border-2';
  const cls = (() => {
    switch (cell.highlight) {
      case 'i': return 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300';
      case 'j': return 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';
      case 'compare': return 'border-blue-400 bg-blue-50 dark:bg-blue-950/30';
      case 'found': return 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-md';
      case 'hit': return 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';
      case 'new': return 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30';
      default: return 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900';
    }
  })();
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-slate-400 font-mono">[{index}]</span>
      <div className={`w-12 h-12 rounded-lg ${baseRing} ${cls} flex items-center justify-center font-mono text-sm font-semibold transition-all`}>
        {cell.value}
      </div>
    </div>
  );
}

export function MapView({ snapshot }: { snapshot: NonNullable<ExplanationStep['map']> }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Hash Map</div>
      {snapshot.entries.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">
          {'{ }'} (empty)
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {snapshot.entries.map((e, i) => <MapEntryView key={i} entry={e} />)}
        </div>
      )}
    </div>
  );
}

export function MapEntryView({ entry }: { entry: MapEntry }) {
  const cls = entry.highlight === 'hit'
    ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 shadow-md'
    : entry.highlight === 'new'
    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-200'
    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
  return (
    <div className={`px-2.5 py-1.5 rounded-lg border-2 ${cls} transition-all`}>
      <code className="font-mono text-xs">{entry.key} <span className="text-slate-400">→</span> {entry.value}</code>
    </div>
  );
}

export function ComputationView({ c }: { c: NonNullable<ExplanationStep['computation']> }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">{c.label}</div>
      <div className="flex items-center gap-2 font-mono text-sm flex-wrap">
        {c.lhs && <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">{c.lhs}</span>}
        {c.op && <span className="text-slate-500">{c.op}</span>}
        {c.rhs && <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">{c.rhs}</span>}
        {c.result && (
          <>
            <span className="text-slate-500">=</span>
            <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-800">{c.result}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function StackView({ snapshot }: { snapshot: StackSnapshot }) {
  const top = snapshot.items.length - 1;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Stack {snapshot.action && <span className="ml-1 text-indigo-500">· {snapshot.action}</span>}
      </div>
      {snapshot.items.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">[ ] (empty)</div>
      ) : (
        <div className="flex flex-col-reverse gap-1 w-fit">
          {snapshot.items.map((cell, i) => (
            <div key={i} className="flex items-center gap-2">
              <CellView index={i} cell={cell} />
              {i === top && <span className="text-[10px] text-indigo-500 font-bold">← top</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SetView({ snapshot }: { snapshot: SetSnapshot }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Set</div>
      {snapshot.items.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">{'{ }'} (empty)</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {snapshot.items.map((it, i) => {
            const cls = it.highlight === 'hit'
              ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200'
              : it.highlight === 'new'
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-200'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
            return (
              <div key={i} className={`px-2.5 py-1 rounded-full border-2 ${cls}`}>
                <code className="font-mono text-xs">{it.value}</code>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DualArrayView({ snapshot }: { snapshot: DualArraySnapshot }) {
  return (
    <div className="flex flex-col gap-3">
      {[snapshot.left, snapshot.right].map((side, idx) => (
        <div key={idx}>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">{side.label}</div>
          <div className="flex gap-1.5 flex-wrap">
            {side.cells.map((c, i) => <CellView key={i} index={i} cell={c} />)}
          </div>
          {typeof side.pointer === 'number' && (
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {side.cells.map((_, i) => (
                <div key={i} className="w-12 flex justify-center">
                  {i === side.pointer && <span className="text-[10px] font-bold text-indigo-500">↑</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {snapshot.result && (
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">{snapshot.result.label}</div>
          <div className="flex gap-1.5 flex-wrap">
            {snapshot.result.cells.length === 0 ? (
              <div className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">[ ]</div>
            ) : snapshot.result.cells.map((c, i) => <CellView key={i} index={i} cell={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export function CallStackView({ snapshot }: { snapshot: CallStackSnapshot }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Call Stack</div>
      <div className="flex flex-col-reverse gap-1">
        {snapshot.frames.map((f, i) => {
          const cls = f.status === 'active'
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-200'
            : f.status === 'returned'
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400';
          return (
            <div key={i} className={`px-3 py-1.5 rounded-md border-2 ${cls} font-mono text-xs flex items-center justify-between`}>
              <span>{f.call}</span>
              {f.returns !== undefined && <span className="text-emerald-600 dark:text-emerald-400 ml-2">→ {f.returns}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LinkedListView({ snapshot }: { snapshot: LinkedListSnapshot }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Linked List</div>
      {snapshot.nodes.length === 0 ? (
        <div className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic">null (empty)</div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          {snapshot.nodes.map((n, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-0.5">
                {n.label && <span className="text-[10px] font-bold text-indigo-500">{n.label}</span>}
                <CellView index={i} cell={{ value: n.value, highlight: n.highlight }} />
              </div>
              {i < snapshot.nodes.length - 1 && <span className="text-slate-400 font-mono">→</span>}
            </React.Fragment>
          ))}
          <span className="text-slate-400 font-mono">→ {snapshot.tail ?? 'null'}</span>
        </div>
      )}
    </div>
  );
}

export function TimelineView({ snapshot }: { snapshot: TimelineSnapshot }) {
  const maxT = Math.max(1, ...snapshot.events.map(e => e.t));
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Timeline {snapshot.windowMs && <span className="ml-1 text-indigo-500">· window {snapshot.windowMs}ms</span>}
      </div>
      <div className="relative h-12 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
        <div className="absolute inset-x-2 top-1/2 h-px bg-slate-300 dark:bg-slate-700" />
        {snapshot.events.map((e, i) => {
          const x = `${(e.t / maxT) * 100}%`;
          const colorCls = e.kind === 'fire'
            ? 'bg-emerald-500 text-white'
            : e.kind === 'input'
            ? 'bg-indigo-500 text-white'
            : e.kind === 'skip'
            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500'
            : 'bg-amber-400 text-white';
          return (
            <div
              key={i}
              style={{ left: x }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorCls} whitespace-nowrap`}
            >
              {e.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LookupView({ outcome }: { outcome: NonNullable<ExplanationStep['lookupOutcome']> }) {
  if (outcome.kind === 'hit') {
    return (
      <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
        ✓ <code className="font-mono mx-1">{outcome.key}</code> is in the map (at index <code className="font-mono">{outcome.at}</code>)
      </div>
    );
  }
  return (
    <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium">
      ✕ <code className="font-mono mx-1">{outcome.key}</code> is not in the map — store the current number and continue
    </div>
  );
}
