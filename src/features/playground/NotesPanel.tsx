import React from 'react';
import { ChevronRight, StickyNote } from 'lucide-react';

// Per-challenge scratchpad, auto-saved alongside the code. Extracted from CodePlayground.

export interface NotesPanelProps {
  notes: string;
  onChange: (notes: string) => void;
  open: boolean;
  onToggle: () => void;
}

export default function NotesPanel({ notes, onChange, open, onToggle }: NotesPanelProps) {
  return (
    <div className="border-t border-[#262421] bg-[#171614] shrink-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-stone-400 hover:text-stone-200 hover:bg-[#1a1917] transition-colors"
        title={open ? 'Collapse notes' : 'Expand notes'}
      >
        <span className="inline-flex items-center gap-2">
          <StickyNote size={12} />
          Notes
          {notes.length > 0 && <span className="text-[10px] text-amber-400/80">· {notes.length} chars</span>}
        </span>
        <ChevronRight size={12} className={open ? 'rotate-90 transition-transform' : 'transition-transform'} />
      </button>
      {open && (
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Notes on this challenge: approach, gotchas, complexity. Saved with your code."
          className="w-full h-32 px-4 py-2 bg-[#121110] text-stone-200 text-sm font-mono resize-none outline-none border-t border-[#262421]"
          spellCheck={false}
        />
      )}
    </div>
  );
}
