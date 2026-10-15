import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, RotateCcw, CalendarCheck } from 'lucide-react';
import { getAllQuestions, type Question } from '../data';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useStudyStats } from '../hooks/useStudyStats';
import { calloutComponents } from '../components/calloutComponents';
import EmptyNote, { NoteLink } from '../components/EmptyNote';

export default function ReviewPage() {
  const { getDueQuestions, recordReview } = useSpacedRepetition();
  const { recordQuestionReviewed } = useStudyStats();

  // getAllQuestions() is async — content is lazy-loaded, so the question bank
  // is fetched rather than bundled. This was previously called synchronously
  // and cast with `as any`, which handed getDueQuestions a Promise; it calls
  // .filter() on it, threw during render, and blanked the page. The casts are
  // gone so the compiler catches this class of mistake from now on.
  const [allQuestions, setAllQuestions] = useState<Question[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getAllQuestions()
      .then((qs) => { if (!cancelled) setAllQuestions(qs); })
      .catch((err: unknown) => {
        console.error('[prephub] review queue failed to load', err);
        if (!cancelled) setAllQuestions([]);   // shows the empty state, not a stuck spinner
      });
    return () => { cancelled = true; };
  }, []);

  const dueQuestions = useMemo(
    () => (allQuestions ? getDueQuestions(allQuestions) : []),
    [allQuestions, getDueQuestions],
  );

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

  // Still fetching the question bank — distinct from "nothing is due".
  if (allQuestions === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="h-6 w-6 rounded-full border-2 border-line border-t-accent animate-spin mb-4" />
        <p className="text-muted">Loading your review queue…</p>
      </div>
    );
  }

  // All done
  if (total === 0 || currentIndex >= total) {
    return (
      <EmptyNote
        Icon={CalendarCheck}
        title={total === 0 ? 'All caught up' : 'Review complete'}
        actions={<>
          <NoteLink to="/"><ArrowLeft size={16} /> Home</NoteLink>
          <NoteLink to="/quiz" primary>Practise more</NoteLink>
        </>}
      >
        {total === 0
          ? 'No questions are due for review today. Great job staying on top of your studies.'
          : `You reviewed ${reviewed} question${reviewed !== 1 ? 's' : ''}. Keep it up!`}
      </EmptyNote>
    );
  }

  // The guards above already imply this, but `noUncheckedIndexedAccess` is off,
  // so nothing forces the check. Stating it means a bad index renders the
  // empty state instead of throwing mid-render and blanking the whole page.
  if (!current) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-2">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="page-title">Daily Review</h1>
          <p className="text-muted mt-2">{total} question{total !== 1 ? 's' : ''} due today</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between font-mono text-xs text-muted mb-2">
          <span className="tabular-nums">{currentIndex + 1} of {total}</span>
          <span className="tabular-nums">{reviewed} reviewed</span>
        </div>
        <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-pop"
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
                <div className="flash-face min-h-[18rem]">
                  <div className="flash-head">
                    <span className="flash-label">Question</span>
                    <span className="flash-meta">{current.guide}</span>
                  </div>
                  <div className="flex-1 quiz-markdown text-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={calloutComponents}>{current.question}</ReactMarkdown>
                  </div>
                  <p className="flash-hint">Tap to reveal the answer</p>
                </div>
              ) : (
                <div className="flash-face flash-face-answer min-h-[18rem]">
                  <div className="flash-head">
                    <span className="flash-label">Answer</span>
                    <span className="flash-meta">{current.guide}</span>
                  </div>
                  <div className="flex-1 quiz-markdown overflow-auto max-h-[50vh]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={calloutComponents}>{current.answer}</ReactMarkdown>
                  </div>
                  <p className="flash-hint">Tap to see the question</p>
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
            className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
          >
            <ThumbsDown size={16} /> Study Again
          </button>
          <button
            onClick={() => handleScore(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <ThumbsUp size={16} /> Got It
          </button>
        </div>
      )}
    </div>
  );
}
