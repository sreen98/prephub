import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, RotateCcw, CalendarCheck } from 'lucide-react';
import { getAllQuestions, type Question } from '../data';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useStudyStats } from '../hooks/useStudyStats';

export default function ReviewPage() {
  const { getDueQuestions, recordReview } = useSpacedRepetition();
  const { recordQuestionReviewed } = useStudyStats();

  const dueQuestions = useMemo(() => getDueQuestions(getAllQuestions() as any) as unknown as Question[], [getDueQuestions]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewed, setReviewed] = useState<number>(0);

  const current: Question | undefined = dueQuestions[currentIndex];
  const total: number = dueQuestions.length;

  const handleScore = useCallback((knew: boolean) => {
    if (current) {
      recordReview(current.id, knew ? 4 : 1);
      recordQuestionReviewed();
      setReviewed((r: number) => r + 1);
    }
    if (currentIndex < total - 1) {
      setCurrentIndex((i: number) => i + 1);
      setIsFlipped(false);
    } else {
      setCurrentIndex(total); // triggers completion
    }
  }, [current, currentIndex, total, recordReview, recordQuestionReviewed]);

  // All done
  if (total === 0 || currentIndex >= total) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <CalendarCheck size={48} className="text-emerald-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">
          {total === 0 ? 'All Caught Up!' : 'Review Complete!'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          {total === 0
            ? 'No questions due for review today. Great job staying on top of your studies!'
            : `You reviewed ${reviewed} question${reviewed !== 1 ? 's' : ''}. Keep it up!`
          }
        </p>
        <div className="flex gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft size={16} /> Home
          </Link>
          <Link to="/quiz" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
            Practice More
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold">Daily Review</h1>
          <p className="text-sm text-slate-500 mt-1">{total} question{total !== 1 ? 's' : ''} due today</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>{currentIndex + 1} of {total}</span>
          <span>{reviewed} reviewed</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <div
          onClick={() => setIsFlipped((f: boolean) => !f)}
          className="cursor-pointer select-none"
          style={{ perspective: '1200px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.id}-${isFlipped}`}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {!isFlipped ? (
                <div className="min-h-[250px] p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">Question</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{current.guide}</span>
                  </div>
                  <div className="flex-1 quiz-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{current.question}</ReactMarkdown>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">Tap to reveal answer</p>
                </div>
              ) : (
                <div className="min-h-[250px] p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-sm flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg mb-4 self-start">Answer</span>
                  <div className="flex-1 quiz-markdown overflow-auto max-h-[50vh]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{current.answer}</ReactMarkdown>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">Tap to see question</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      {isFlipped && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleScore(false)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
          >
            <ThumbsDown size={16} /> Study Again
          </button>
          <button
            onClick={() => handleScore(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <ThumbsUp size={16} /> Got It
          </button>
        </div>
      )}
    </div>
  );
}
