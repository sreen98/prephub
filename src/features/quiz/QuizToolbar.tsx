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
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold">Quiz Mode</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedGuide}
            onChange={(e) => onGuideChange(e.target.value)}
            className="text-sm px-3 py-2 rounded-md border border-line bg-surface outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
          >
            {guideOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-md border transition-colors ${isShuffled ? 'bg-accent-soft border-accent/30 text-accent' : 'border-line text-muted hover:text-ink'}`}
            title="Shuffle questions"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-md border border-line text-muted hover:text-ink transition-colors"
            title="Reset progress"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-muted mr-1">Difficulty:</span>
        <div className="flex items-center gap-1 bg-ink/5 rounded-md p-0.5">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize',
                difficulty === level
                  ? 'bg-surface shadow-sm text-ink'
                  : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {level === 'all' ? 'All' : level}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted mb-2">
          <span>{currentIndex + 1} of {total}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600"><ThumbsUp size={12} /> {score.knew}</span>
            <span className="flex items-center gap-1 text-amber-600"><ThumbsDown size={12} /> {score.learning}</span>
          </span>
        </div>
        <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
}
