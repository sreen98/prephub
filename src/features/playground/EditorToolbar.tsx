import { Braces, ChevronsDown, ChevronsUp, Loader2, PanelRightClose, PanelRightOpen, Play, Wand2, WrapText } from 'lucide-react';
import { ProblemButton } from './ChallengeProblemPanel';

// The strip above the editor: the Problem button and language on the left, the
// editor's own switches on the right. Extracted from CodePlayground, which sits
// at its line ceiling.
//
// With the page header hidden (focus mode), this strip also carries a compact
// Run button, so running never needs the header (Ctrl/Cmd+Enter works too).

const BASE = 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors whitespace-nowrap ';
const NEUTRAL = 'border-[#36332e] text-stone-300 hover:bg-[#262421] hover:text-white';
const OFF = 'border-[#36332e] text-stone-500 hover:bg-[#262421] hover:text-stone-300';

export interface EditorToolbarProps {
  langLabel: string;
  isLoadingTemplate: boolean;
  onProblem?: () => void;
  outputHidden: boolean;
  onToggleOutput: () => void;
  headerHidden: boolean;
  onToggleHeader: () => void;
  bracketAutoClose: boolean;
  onToggleAutoClose: () => void;
  wrapOn: boolean;
  onToggleWrap: () => void;
  isFormatting: boolean;
  onFormat: () => void;
  lineCount: number;
  onRun: () => void;
  isRunning: boolean;
}

export default function EditorToolbar(p: EditorToolbarProps) {
  return (
    <div className="px-4 py-2 h-10 text-xs font-medium text-stone-500 border-b border-[#262421] bg-[#1a1917] shrink-0 flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 min-w-0">
        {p.onProblem && <ProblemButton onClick={p.onProblem} />}
        <span className="truncate">{p.langLabel}</span>
        {p.isLoadingTemplate && (
          <span className="inline-flex items-center gap-1 text-stone-400">
            <Loader2 size={11} className="animate-spin" />
            loading template…
          </span>
        )}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={p.onToggleHeader} aria-pressed={p.headerHidden} className={BASE + NEUTRAL}
          title={p.headerHidden ? 'Show the playground header and its buttons' : 'Hide the playground header for more room (Run stays here)'}>
          {p.headerHidden ? <ChevronsDown size={11} /> : <ChevronsUp size={11} />}{p.headerHidden ? 'Show header' : 'Hide header'}
        </button>
        <button onClick={p.onToggleOutput} aria-pressed={p.outputHidden} className={'hidden md:inline-flex ' + BASE + NEUTRAL}
          title={p.outputHidden ? 'Show the console and preview' : 'Hide the console and preview, so the editor takes the full width'}>
          {p.outputHidden ? <PanelRightOpen size={11} /> : <PanelRightClose size={11} />}{p.outputHidden ? 'Show output' : 'Hide output'}
        </button>
        <button onClick={p.onToggleAutoClose} className={BASE + (p.bracketAutoClose ? 'border-emerald-700/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30' : OFF)}
          title={p.bracketAutoClose ? 'Bracket auto-close: ON (click to disable)' : 'Bracket auto-close: OFF (click to enable)'}>
          <Braces size={11} />{p.bracketAutoClose ? 'Auto-close on' : 'Auto-close off'}
        </button>
        <button onClick={p.onToggleWrap} className={BASE + (p.wrapOn ? 'border-teal-600/50 bg-teal-900/20 text-teal-300 hover:bg-teal-900/30' : OFF)}
          title={p.wrapOn ? 'Word wrap: ON (long lines break visually)' : 'Word wrap: OFF (long lines scroll horizontally)'}>
          <WrapText size={11} />{p.wrapOn ? 'Wrap on' : 'Wrap off'}
        </button>
        <button onClick={p.onFormat} disabled={p.isFormatting} className={BASE + NEUTRAL + ' disabled:opacity-60'} title="Format with Prettier (⌘⇧F)">
          {p.isFormatting ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}Format
        </button>
        <span className="text-stone-600 whitespace-nowrap hidden xl:inline">{p.lineCount} lines</span>
        {p.headerHidden && (
          <button onClick={p.onRun} disabled={p.isRunning} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60" title="Run (⌘/Ctrl+Enter)">
            {p.isRunning ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}Run
          </button>
        )}
      </div>
    </div>
  );
}
