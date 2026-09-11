import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface OutputEntry {
  type: 'log' | 'warn' | 'error' | 'result';
  text: string;
}

interface OutputPanelProps {
  output: OutputEntry[];
  hasPreview: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

// Memoized: only re-renders when output / hasPreview / previewRef change.
// Without this, every keystroke in the editor would re-render the whole
// output list (which can be hundreds of rows for a chatty test run).
function OutputPanelImpl({ output, hasPreview, previewRef }: OutputPanelProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Console — when React preview is shown, split vertical space evenly */}
      <div className={hasPreview ? 'flex-1 flex flex-col min-h-[160px] basis-0' : 'flex-1 flex flex-col min-h-[100px]'}>
        <div className="px-4 py-2 h-10 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Console Output
          {output.length > 0 && <span className="ml-1 text-[10px] text-slate-600">({output.length})</span>}
        </div>
        <div className="flex-1 overflow-auto p-4 bg-[#1e1e2e] font-mono text-sm min-h-0">
          {output.length === 0 && !hasPreview ? (
            <div className="text-slate-500 italic">
              Click "Run" or press ⌘+Enter to execute your code...
            </div>
          ) : output.length === 0 ? (
            <div className="text-slate-600 italic text-xs">No console output yet — logs will appear here.</div>
          ) : (
            output.map((entry, i) => (
              <OutputRow key={i} entry={entry} />
            ))
          )}
        </div>
      </div>

      {/* React Preview — always mounted, toggled via CSS */}
      <div className={hasPreview ? 'flex-1 flex flex-col min-h-[160px] basis-0 border-t border-[#2d333b]' : 'h-0 overflow-hidden'}>
        <div className="px-4 py-2 h-10 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          React Preview
        </div>
        <div
          ref={previewRef}
          className="flex-1 overflow-auto bg-white text-slate-900 p-2 min-h-0"
        />
      </div>
    </div>
  );
}

const OutputRow = memo(function OutputRow({ entry }: { entry: OutputEntry }) {
  const colorClass =
    entry.type === 'error' ? 'text-red-400' :
    entry.type === 'warn' ? 'text-yellow-400' :
    entry.type === 'result' ? 'text-blue-400' :
    'text-[#a6e3a1]';
  return (
    <div className={`py-1 border-b border-slate-800/50 last:border-0 ${colorClass}`}>
      {entry.type === 'error' && <AlertTriangle size={12} className="inline mr-2" />}
      <span className="whitespace-pre-wrap">{entry.text}</span>
    </div>
  );
});

export const OutputPanel = memo(OutputPanelImpl);
