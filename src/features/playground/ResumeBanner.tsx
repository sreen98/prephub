import React from 'react';
import { X } from 'lucide-react';
import { allTemplates, type FlatTemplateMeta } from '../../data/playground/templateIndex';
import type { ProgressEntry } from '../../hooks/usePlaygroundProgress';

// "Resume <last challenge>": shown only when the last session was left in
// progress and is not the template already open. Extracted from CodePlayground.

function ago(updatedAt: string): string {
  const min = Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  return hr < 24 ? `${hr} hr ago` : `${Math.round(hr / 24)} d ago`;
}

export interface ResumeBannerProps {
  lastSessionName: string | null;
  selectedName: string | null;
  dismissed: boolean;
  onDismiss: () => void;
  getEntry: (name: string) => ProgressEntry | null;
  onResume: (template: FlatTemplateMeta) => void;
}

export default function ResumeBanner({ lastSessionName, selectedName, dismissed, onDismiss, getEntry, onResume }: ResumeBannerProps) {
  if (dismissed || !lastSessionName || lastSessionName === selectedName) return null;
  const entry = getEntry(lastSessionName);
  if (!entry || entry.status !== 'in-progress') return null;
  const tpl = allTemplates.find((t) => t.name === lastSessionName);
  if (!tpl) return null;
  return (
    <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-xs flex items-center gap-2 shrink-0">
      <span className="text-indigo-300/80">▶</span>
      <button onClick={() => onResume(tpl)} className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium">
        Resume &quot;{lastSessionName}&quot;
      </button>
      <span className="text-slate-500">— last edited {ago(entry.updatedAt)}</span>
      <button onClick={onDismiss} className="ml-auto text-slate-500 hover:text-slate-300" aria-label="Dismiss" title="Dismiss for this session">
        <X size={12} />
      </button>
    </div>
  );
}
