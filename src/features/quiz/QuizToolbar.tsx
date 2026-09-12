import { Link } from 'react-router-dom';
import { ArrowLeft, Shuffle, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

export interface GuideOption { value: string; label: string }

const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'] as const;

/**
 * The chrome above the flashcard: guide picker, shuffle, reset, difficulty
 * chips and the progress bar.
 *
 * Extracted from QuizMode, whose render was 343 lines against a 300-line
 * limit. None of this reads the current question — it only needs the filter
 * and score values — so it lifts out cleanly and leaves QuizMode as the
 * flashcard plus its keyboard handling.
 */
export default function QuizToolbar({
  guideOptions, selectedGuide, onGuideChange,
  isShuffled, onToggleShuffle, onReset,
  difficulty, onDifficultyChange,
  currentIndex, total, score, progress,
}: {
  guideOptions: GuideOption[];
  selectedGuide: string;
  onGuideChange: (value: string) => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  onReset: () => void;
  difficulty: string;
  onDifficultyChange: (level: string) => void;
  currentIndex: number;
  total: number;
  score: { knew: number; learning: number };
  progress: number;
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold">Quiz Mode</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedGuide}
            onChange={(e) => onGuideChange(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow"
          >
            {guideOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-xl border transition-colors ${isShuffled ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            title="Shuffle questions"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Reset progress"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Difficulty:</span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize',
                difficulty === level
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
              ].join(' ')}
            >
              {level === 'all' ? 'All' : level}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
          <span>{currentIndex + 1} of {total}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600"><ThumbsUp size={12} /> {score.knew}</span>
            <span className="flex items-center gap-1 text-amber-600"><ThumbsDown size={12} /> {score.learning}</span>
          </span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
}
