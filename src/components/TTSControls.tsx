import React from 'react';
import { Play, Pause, Square, FastForward } from 'lucide-react';

const SPEEDS: number[] = [0.75, 1, 1.25, 1.5];

interface TTSControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSetRate: (rate: number) => void;
}

export default function TTSControls({ isPlaying, isPaused, rate, onPause, onResume, onStop, onSetRate }: TTSControlsProps) {
  if (!isPlaying) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
      {isPaused ? (
        <button onClick={onResume} className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors" title="Resume">
          <Play size={14} />
        </button>
      ) : (
        <button onClick={onPause} className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors" title="Pause">
          <Pause size={14} />
        </button>
      )}
      <button onClick={onStop} className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors" title="Stop">
        <Square size={14} />
      </button>
      <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-700 mx-0.5" />
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onSetRate(s)}
          className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
            rate === s
              ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-bold'
              : 'text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300'
          }`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
