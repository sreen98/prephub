import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Timer, Play, SkipForward, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { menuStructure, getAllQuestions, type Question, type MenuSection } from '../data';
import { useStudyStats } from '../hooks/useStudyStats';
import { calloutComponents } from '../components/calloutComponents';

interface InterviewConfig {
  questionCount: number;
  timeLimit: number;
  categories: string[];
}

interface InterviewResult {
  questionId: string;
  guide: string;
  correct: boolean;
  skipped: boolean;
}

interface CategoryBreakdown {
  total: number;
  correct: number;
}

type Phase = 'setup' | 'interview' | 'results';

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const categories: string[] = menuStructure.filter((s: MenuSection) => s.items).map((s: MenuSection) => s.name);

/** A pressed/unpressed choice on the setup sheet. */
const choiceClass = (on: boolean) =>
  `px-4 py-2 rounded-md border text-sm font-medium transition-colors ${on ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:text-ink hover:border-ink/30'}`;

/** Difficulty chip colours: the 700 shades in light, so each clears AA on its tint. */
const difficultyClass = (d: string) =>
  d === 'beginner' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
    : d === 'intermediate' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400'
      : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400';

/** The score sheet: lifted out of InterviewSimulator to keep that function under the size limit. */
function InterviewResults({ results, timeTaken, onRetry }: { results: InterviewResult[]; timeTaken: number; onRetry: () => void }) {
  const correct: number = results.filter((r: InterviewResult) => r.correct).length;
  const skipped: number = results.filter((r: InterviewResult) => r.skipped).length;
  const answered: number = results.length - skipped;
  const score: number = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  // Category breakdown
  const breakdown: Record<string, CategoryBreakdown> = {};
  for (const r of results) {
    const section = menuStructure.find((s) => s.items?.some((i) => i.name === r.guide));
    const cat: string = section?.name ?? 'Other';
    if (!breakdown[cat]) breakdown[cat] = { total: 0, correct: 0 };
    breakdown[cat].total++;
    if (r.correct) breakdown[cat].correct++;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="page-title mb-3">Interview complete</h1>
      <p className="text-lg text-muted mb-8">
        You scored <span className="hl font-semibold text-ink">{score}%</span> in {formatTime(timeTaken)}.
      </p>

      {/* Score cards */}
      <dl className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
        {([
          ['Correct', correct, 'text-emerald-700 dark:text-emerald-400'],
          ['Incorrect', answered - correct, 'text-amber-800 dark:text-amber-400'],
          ['Skipped', skipped, 'text-muted'],
        ] as const).map(([label, n, tone]) => (
          <div key={label} className="index-card px-4 py-4">
            <dt className="index-card-head pb-2 mb-2 font-mono text-xs text-muted">{label}</dt>
            <dd className={`font-display text-4xl font-semibold tabular-nums ${tone}`}>{n}</dd>
          </div>
        ))}
      </dl>

      {/* Category breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <section className="mb-10" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="font-display text-2xl font-semibold mb-4">By category</h2>
          <ul>
            {Object.entries(breakdown).map(([cat, data]: [string, CategoryBreakdown]) => {
              const pct: number = Math.round((data.correct / data.total) * 100);
              const isWeak: boolean = pct < 50;
              return (
                <li key={cat} className="flex items-center gap-3 py-2 border-b border-line">
                  <span className="text-sm w-36 truncate">{cat}</span>
                  <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isWeak ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`font-mono text-xs font-semibold w-12 text-right tabular-nums ${isWeak ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {data.correct}/{data.total}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={onRetry} className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-line bg-surface hover:border-accent hover:text-accent transition-colors text-sm font-semibold">
          <RotateCcw size={14} /> Try again
        </button>
        <Link to="/" className="px-5 py-2.5 rounded-md bg-accent text-accent-contrast text-sm font-semibold hover:bg-accent-strong transition-colors">
          Back home
        </Link>
      </div>
    </div>
  );
}

export default function InterviewSimulator() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [config, setConfig] = useState<InterviewConfig>({ questionCount: 20, timeLimit: 30, categories: [...categories] });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { recordQuestionReviewed } = useStudyStats();

  // Timer
  useEffect(() => {
    if (phase !== 'interview') return;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current as number)) / 1000);
      const remaining = config.timeLimit * 60 - elapsed;
      if (remaining <= 0) {
        clearInterval(timerRef.current as ReturnType<typeof setInterval>);
        setPhase('results');
      }
      setTimeLeft(Math.max(0, remaining));
    }, 1000);
    return () => clearInterval(timerRef.current as ReturnType<typeof setInterval>);
  }, [phase, config.timeLimit]);

  // async because getAllQuestions() now fetches the lazy content chunks. The
  // button shows a starting state while it resolves — see isStarting below.
  const [isStarting, setIsStarting] = useState(false);
  const startInterview = async (): Promise<void> => {
    setIsStarting(true);
    const all = await getAllQuestions();
    setIsStarting(false);
    const allQ: Question[] = all.filter((q: Question) => {
      const section = menuStructure.find((s) => s.items?.some((i) => i.name === q.guide));
      return section !== undefined && config.categories.includes(section.name);
    });
    const shuffled = shuffleArray(allQ).slice(0, config.questionCount);
    setQuestions(shuffled);
    setResults([]);
    setCurrentIndex(0);
    setIsRevealed(false);
    setTimeLeft(config.timeLimit * 60);
    startTimeRef.current = Date.now();
    setPhase('interview');
  };

  const handleAnswer = (correct: boolean): void => {
    recordQuestionReviewed();
    setResults((prev: InterviewResult[]) => [...prev, { questionId: questions[currentIndex].id, guide: questions[currentIndex].guide, correct, skipped: false }]);
    advance();
  };

  const handleSkip = (): void => {
    setResults((prev: InterviewResult[]) => [...prev, { questionId: questions[currentIndex].id, guide: questions[currentIndex].guide, correct: false, skipped: true }]);
    advance();
  };

  const advance = (): void => {
    if (currentIndex >= questions.length - 1) {
      clearInterval(timerRef.current as ReturnType<typeof setInterval>);
      setPhase('results');
    } else {
      setCurrentIndex((i: number) => i + 1);
      setIsRevealed(false);
    }
  };

  const toggleCategory = (cat: string): void => {
    setConfig((prev: InterviewConfig) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c: string) => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  // Setup Phase: the exam sheet
  if (phase === 'setup') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-4">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="page-title mb-3">Interview Simulator</h1>
        <p className="text-lg text-muted mb-8">A timed mock interview with random questions. Set the paper, then turn it over.</p>

        <div className="paper-sheet rounded-sm px-5 py-7 md:pl-[4.5rem] md:pr-10 md:py-10 space-y-8">
          <fieldset>
            <legend className="font-display text-xl font-semibold mb-3">Number of questions</legend>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30].map((n: number) => (
                <button key={n} type="button" aria-pressed={config.questionCount === n} onClick={() => setConfig((p: InterviewConfig) => ({ ...p, questionCount: n }))} className={choiceClass(config.questionCount === n)}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl font-semibold mb-3">Time limit</legend>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45].map((n: number) => (
                <button key={n} type="button" aria-pressed={config.timeLimit === n} onClick={() => setConfig((p: InterviewConfig) => ({ ...p, timeLimit: n }))} className={choiceClass(config.timeLimit === n)}>
                  {n} min
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl font-semibold mb-1">Categories</legend>
            <p className="text-sm text-muted mb-3">Questions are drawn from the categories that are switched on.</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat: string) => {
                const on = config.categories.includes(cat);
                return (
                  <button key={cat} type="button" aria-pressed={on} onClick={() => toggleCategory(cat)} className={`${choiceClass(on)} ${on ? '' : 'line-through'}`}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            onClick={startInterview}
            disabled={config.categories.length === 0 || isStarting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-md disabled:opacity-40 text-accent-contrast font-semibold transition-colors bg-accent hover:bg-accent-strong"
          >
            {isStarting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-accent-contrast/40 border-t-accent-contrast animate-spin" />
                Loading questions…
              </>
            ) : (
              <><Play size={18} /> Start the interview</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Interview Phase
  if (phase === 'interview') {
    const current: Question = questions[currentIndex];
    const isLowTime: boolean = timeLeft < 120;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-muted tabular-nums">Question {currentIndex + 1} of {questions.length}</span>
          <span className={`text-2xl font-semibold font-mono tabular-nums ${isLowTime ? 'text-red-700 dark:text-red-400 animate-pulse' : 'text-ink'}`}>
            <Timer size={18} className="inline mr-1.5 -mt-1" aria-hidden="true" />
            <span className="sr-only">Time left </span>{formatTime(timeLeft)}
          </span>
        </div>

        {/* Progress */}
        <div className="h-2 bg-ink/10 rounded-full mb-8 overflow-hidden">
          <div className="h-full rounded-full transition-all bg-pop" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question */}
        <div className="flash-face mb-6 min-h-[14rem]">
          <div className="flash-head">
            <span className="flash-label">Question {currentIndex + 1}</span>
            <span className="flash-meta">{current.guide}</span>
            {current.difficulty && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${difficultyClass(current.difficulty)}`}>
                {current.difficulty}
              </span>
            )}
          </div>
          <div className="quiz-markdown text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={calloutComponents}>{current.question}</ReactMarkdown>
          </div>
        </div>

        {/* Answer (revealed) */}
        {isRevealed && (
          <div className="flash-face flash-face-answer mb-6">
            <div className="flash-head">
              <span className="flash-label">Answer</span>
            </div>
            <div className="quiz-markdown overflow-auto max-h-[40vh]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={calloutComponents}>{current.answer}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isRevealed ? (
            <>
              <button onClick={() => setIsRevealed(true)} className="px-6 py-3 rounded-md bg-accent text-accent-contrast font-semibold hover:bg-accent-strong transition-colors">
                Reveal the answer
              </button>
              <button onClick={handleSkip} className="flex items-center gap-2 px-4 py-3 rounded-md border border-line bg-surface text-muted hover:text-ink transition-colors text-sm">
                <SkipForward size={14} /> Skip
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleAnswer(false)} className="flex items-center gap-2 px-5 py-3 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-medium text-sm hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
                <ThumbsDown size={16} /> Didn&apos;t know
              </button>
              <button onClick={() => handleAnswer(true)} className="flex items-center gap-2 px-5 py-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-medium text-sm hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors">
                <ThumbsUp size={16} /> Got it
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <InterviewResults
      results={results}
      timeTaken={config.timeLimit * 60 - timeLeft}
      onRetry={() => { setPhase('setup'); setResults([]); }}
    />
  );
}
