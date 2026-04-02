import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, RotateCcw, Shuffle,
  ThumbsUp, ThumbsDown, ArrowLeft, BookOpen, Bookmark, BookmarkCheck
} from 'lucide-react';
import { menuStructure, getAllQuestions, extractQuestions, contentFiles, type Question } from '../data';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useStudyStats } from '../hooks/useStudyStats';
import { useBookmarks } from '../hooks/useBookmarks';

interface GuideOption {
  value: string;
  label: string;
}

interface Score {
  knew: number;
  learning: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizMode() {
  const [selectedGuide, setSelectedGuide] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [score, setScore] = useState<Score>({ knew: 0, learning: 0 });
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<string>('all');
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const { recordReview } = useSpacedRepetition();
  const { recordQuestionReviewed } = useStudyStats();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Build guide options
  const guideOptions: GuideOption[] = useMemo(() => {
    const options: GuideOption[] = [{ value: 'all', label: 'All Guides' }];
    for (const section of menuStructure) {
      if (!(section as any).items) continue;
      for (const item of (section as any).items) {
        const content: string = (contentFiles as Record<string, string>)[item.file] || '';
        const qs: Question[] = extractQuestions(content, item.name);
        if (qs.length > 0) {
          options.push({ value: item.name, label: `${item.name} (${qs.length})` });
        }
      }
    }
    return options;
  }, []);

  // Get filtered questions
  const questions: Question[] = useMemo(() => {
    let qs: Question[];
    if (selectedGuide === 'all') {
      qs = getAllQuestions();
    } else {
      const item = menuStructure.flatMap((s: any) => s.items || []).find((i: any) => i.name === selectedGuide);
      if (item) {
        qs = extractQuestions((contentFiles as Record<string, string>)[(item as any).file] || '', (item as any).name);
      } else {
        qs = [];
      }
    }
    if (difficulty !== 'all') {
      qs = qs.filter((q: Question) => q.difficulty === difficulty);
    }
    return isShuffled ? shuffleArray(qs) : qs;
  }, [selectedGuide, isShuffled, difficulty]);

  const currentQuestion: Question | undefined = questions[currentIndex];
  const total: number = questions.length;
  const progress: number = total > 0 ? ((reviewed.size / total) * 100) : 0;

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i: number) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i: number) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleScore = useCallback((knew: boolean) => {
    if (currentQuestion) {
      setReviewed((prev: Set<string>) => new Set(prev).add(currentQuestion.id));
      setScore((prev: Score) => ({
        knew: prev.knew + (knew ? 1 : 0),
        learning: prev.learning + (knew ? 0 : 1),
      }));
      recordReview(currentQuestion.id, knew ? 4 : 1);
      recordQuestionReviewed();
    }
    handleNext();
  }, [currentQuestion, handleNext, recordReview, recordQuestionReviewed]);

  const handleReset = (): void => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ knew: 0, learning: 0 });
    setReviewed(new Set());
  };

  const handleGuideChange = (value: string): void => {
    setSelectedGuide(value);
    setDifficulty('all');
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ knew: 0, learning: 0 });
    setReviewed(new Set());
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <BookOpen size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Quiz Questions Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          {selectedGuide === 'all'
            ? 'No interview questions could be extracted from the guides.'
            : `No questions found in "${selectedGuide}". Try a different guide.`}
        </p>
        <div className="flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back Home
          </Link>
          {selectedGuide !== 'all' && (
            <button
              onClick={() => handleGuideChange('all')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              Try All Guides
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold">Quiz Mode</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedGuide}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleGuideChange(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow"
          >
            {guideOptions.map((opt: GuideOption) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => { setIsShuffled((s: boolean) => !s); setCurrentIndex(0); setIsFlipped(false); }}
            className={`p-2 rounded-xl border transition-colors ${isShuffled ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            title="Shuffle questions"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Reset progress"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-slate-500 mr-1">Difficulty:</span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
          {['all', 'beginner', 'intermediate', 'advanced'].map((level: string) => (
            <button
              key={level}
              onClick={() => { setDifficulty(level); setCurrentIndex(0); setIsFlipped(false); setScore({ knew: 0, learning: 0 }); setReviewed(new Set()); }}
              className={[
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize",
                difficulty === level
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              ].join(' ')}
            >
              {level === 'all' ? 'All' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
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

      {/* Flashcard */}
      {currentQuestion && (
        <div className="mb-8">
          <div
            onClick={() => setIsFlipped((f: boolean) => !f)}
            className="cursor-pointer select-none"
            style={{ perspective: '1200px' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentQuestion.id}-${isFlipped ? 'back' : 'front'}`}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {!isFlipped ? (
                  /* Question Side */
                  <div className="min-h-[280px] p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex flex-col relative">
                    {/* Bookmark button */}
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        toggleBookmark({ id: `quiz__${currentQuestion.id}`, questionId: currentQuestion.id, questionText: currentQuestion.question.slice(0, 100), guideName: currentQuestion.guide, type: 'quiz' });
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      {isBookmarked(`quiz__${currentQuestion.id}`) ? <BookmarkCheck size={18} className="text-amber-500 fill-amber-500" /> : <Bookmark size={18} />}
                    </button>
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                        Question
                      </span>
                      {currentQuestion.guide && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {currentQuestion.guide}
                        </span>
                      )}
                      {currentQuestion.difficulty && (
                        <span className={[
                          "text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize",
                          currentQuestion.difficulty === 'beginner' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
                          currentQuestion.difficulty === 'intermediate' ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" :
                          "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                        ].join(' ')}>
                          {currentQuestion.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 quiz-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {currentQuestion.question}
                      </ReactMarkdown>
                    </div>
                    <p className="text-xs text-slate-400 mt-6 text-center">
                      Tap to reveal answer
                    </p>
                  </div>
                ) : (
                  /* Answer Side */
                  <div className="min-h-[280px] p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                        Answer
                      </span>
                    </div>
                    <div className="flex-1 quiz-markdown overflow-auto max-h-[50vh]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {currentQuestion.answer}
                      </ReactMarkdown>
                    </div>
                    <p className="text-xs text-slate-400 mt-6 text-center">
                      Tap to see question
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isFlipped && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScore(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
            >
              <ThumbsDown size={14} /> Study Again
            </button>
            <button
              onClick={() => handleScore(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
            >
              <ThumbsUp size={14} /> Got It
            </button>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={currentIndex >= total - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Completion */}
      {reviewed.size === total && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/50 text-center"
        >
          <h3 className="text-lg font-bold mb-2">Quiz Complete!</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You reviewed all {total} questions.
            <span className="text-emerald-600 font-semibold"> {score.knew} knew</span>,
            <span className="text-amber-600 font-semibold"> {score.learning} to review</span>.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
          >
            <RotateCcw size={16} /> Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
