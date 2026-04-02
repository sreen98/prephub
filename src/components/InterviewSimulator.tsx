import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import { ArrowLeft, Timer, Play, SkipForward, ThumbsUp, ThumbsDown, RotateCcw, Trophy } from 'lucide-react';
import { menuStructure, getAllQuestions, extractQuestions, contentFiles, type Question, type MenuSection } from '../data';
import { useStudyStats } from '../hooks/useStudyStats';

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

  const startInterview = (): void => {
    const allQ: Question[] = getAllQuestions().filter((q: Question) => {
      const section = menuStructure.find((s: any) => s.items?.some((i: any) => i.name === q.guide));
      return section && config.categories.includes((section as any).name);
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

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-2xl font-extrabold mb-2">Interview Simulator</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Simulate a timed mock interview with random questions.</p>

        <div className="space-y-6">
          {/* Questions */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Number of Questions</label>
            <div className="flex gap-2">
              {[10, 20, 30].map((n: number) => (
                <button
                  key={n}
                  onClick={() => setConfig((p: InterviewConfig) => ({ ...p, questionCount: n }))}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${config.questionCount === n ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Time Limit</label>
            <div className="flex gap-2">
              {[15, 30, 45].map((n: number) => (
                <button
                  key={n}
                  onClick={() => setConfig((p: InterviewConfig) => ({ ...p, timeLimit: n }))}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${config.timeLimit === n ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {n} min
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${config.categories.includes(cat) ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startInterview}
            disabled={config.categories.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Play size={18} /> Start Interview
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
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-slate-500">Question {currentIndex + 1} of {questions.length}</span>
          <span className={`text-lg font-bold font-mono ${isLowTime ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
            <Timer size={16} className="inline mr-1" />
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question */}
        <div className="min-h-[200px] p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{current.guide}</span>
            {current.difficulty && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${current.difficulty === 'beginner' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : current.difficulty === 'intermediate' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600' : 'bg-red-50 dark:bg-red-950/30 text-red-600'}`}>
                {current.difficulty}
              </span>
            )}
          </div>
          <div className="quiz-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{current.question}</ReactMarkdown>
          </div>
        </div>

        {/* Answer (revealed) */}
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/10 mb-6"
          >
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 block">Answer</span>
            <div className="quiz-markdown overflow-auto max-h-[40vh]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{current.answer}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRevealed ? (
            <>
              <button onClick={() => setIsRevealed(true)} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
                Reveal Answer
              </button>
              <button onClick={handleSkip} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                <SkipForward size={14} /> Skip
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleAnswer(false)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-medium text-sm hover:bg-amber-100 transition-colors">
                <ThumbsDown size={16} /> Didn't Know
              </button>
              <button onClick={() => handleAnswer(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-medium text-sm hover:bg-emerald-100 transition-colors">
                <ThumbsUp size={16} /> Got It
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Results Phase
  const correct: number = results.filter((r: InterviewResult) => r.correct).length;
  const skipped: number = results.filter((r: InterviewResult) => r.skipped).length;
  const answered: number = results.length - skipped;
  const timeTaken: number = config.timeLimit * 60 - timeLeft;
  const score: number = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  // Category breakdown
  const breakdown: Record<string, CategoryBreakdown> = {};
  for (const r of results) {
    const section = menuStructure.find((s: any) => s.items?.some((i: any) => i.name === r.guide));
    const cat: string = (section as any)?.name || 'Other';
    if (!breakdown[cat]) breakdown[cat] = { total: 0, correct: 0 };
    breakdown[cat].total++;
    if (r.correct) breakdown[cat].correct++;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <Trophy size={48} className={`mx-auto mb-4 ${score >= 70 ? 'text-amber-500' : 'text-slate-400'}`} />
          <h1 className="text-3xl font-extrabold mb-2">Interview Complete!</h1>
          <p className="text-slate-500">You scored <strong className={score >= 70 ? 'text-emerald-600' : 'text-amber-600'}>{score}%</strong> in {formatTime(timeTaken)}</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="text-2xl font-extrabold text-emerald-600">{correct}</div>
            <div className="text-xs text-emerald-600/70">Correct</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
            <div className="text-2xl font-extrabold text-amber-600">{answered - correct}</div>
            <div className="text-xs text-amber-600/70">Incorrect</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-extrabold text-slate-500">{skipped}</div>
            <div className="text-xs text-slate-400">Skipped</div>
          </div>
        </div>

        {/* Category breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold mb-3">Category Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(breakdown).map(([cat, data]: [string, CategoryBreakdown]) => {
                const pct: number = Math.round((data.correct / data.total) * 100);
                const isWeak: boolean = pct < 50;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm w-32 truncate">{cat}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isWeak ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-medium w-12 text-right ${isWeak ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {data.correct}/{data.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button onClick={() => { setPhase('setup'); setResults([]); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
            <RotateCcw size={14} /> Try Again
          </button>
          <Link to="/" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
            Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
