import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, RotateCcw, Shuffle,
  ThumbsUp, ThumbsDown, ArrowLeft, BookOpen, Bookmark, BookmarkCheck
} from 'lucide-react';
import { menuStructure, extractQuestions, loadAllContent, type Question } from '../data';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useStudyStats } from '../hooks/useStudyStats';
import { useBookmarks } from '../hooks/useBookmarks';
import QuizToolbar from '../features/quiz/QuizToolbar';
import { calloutComponents } from '../components/calloutComponents';
import EmptyNote, { NoteLink, NoteButton } from '../components/EmptyNote';

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

  // Guide content is lazy-loaded (see data.ts) so it isn't in the main bundle.
  // Quiz needs the whole corpus to count and extract questions, so fetch it on
  // mount — loadAllContent memoises, so arriving here from the Interview
  // Simulator reuses the same download.
  const [corpus, setCorpus] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadAllContent()
      .then((all) => { if (!cancelled) setCorpus(all); })
      .catch((err: unknown) => {
        console.error('[prephub] quiz corpus failed to load', err);
        if (!cancelled) setCorpus({});   // end the loading state rather than hanging
      });
    return () => { cancelled = true; };
  }, []);

  // Build guide options
  const guideOptions: GuideOption[] = useMemo(() => {
    const options: GuideOption[] = [{ value: 'all', label: 'All Guides' }];
    for (const section of menuStructure) {
      if (!section.items) continue;
      for (const item of section.items) {
        const content: string = corpus?.[item.file] || '';
        const qs: Question[] = extractQuestions(content, item.name);
        if (qs.length > 0) {
          options.push({ value: item.name, label: `${item.name} (${qs.length})` });
        }
      }
    }
    return options;
  }, [corpus]);

  // Get filtered questions
  const questions: Question[] = useMemo(() => {
    if (!corpus) return [];
    let qs: Question[] = [];
    if (selectedGuide === 'all') {
      for (const section of menuStructure) {
        for (const item of section.items || []) {
          qs.push(...extractQuestions(corpus[item.file] || '', item.name));
        }
      }
    } else {
      const item = menuStructure.flatMap((s) => s.items ?? []).find((i) => i.name === selectedGuide);
      if (item) {
        qs = extractQuestions(corpus[(item).file] || '', (item).name);
      }
    }
    if (difficulty !== 'all') {
      qs = qs.filter((q: Question) => q.difficulty === difficulty);
    }
    return isShuffled ? shuffleArray(qs) : qs;
  }, [selectedGuide, isShuffled, difficulty, corpus]);

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

  // Distinguish "still fetching the corpus" from "genuinely no questions",
  // otherwise the empty state flashes on every visit while content loads.
  if (!corpus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="h-6 w-6 rounded-full border-2 border-line border-t-accent animate-spin mb-4" />
        <p className="text-muted">Loading questions…</p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <EmptyNote
        Icon={BookOpen}
        title="No questions found"
        actions={<>
          <NoteLink to="/"><ArrowLeft size={16} /> Back home</NoteLink>
          {selectedGuide !== 'all' && <NoteButton primary onClick={() => handleGuideChange('all')}>Try all guides</NoteButton>}
        </>}
      >
        {selectedGuide === 'all'
          ? 'No interview questions could be extracted from the guides.'
          : `No questions found in "${selectedGuide}". Try a different guide.`}
      </EmptyNote>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <QuizToolbar
        guideOptions={guideOptions}
        selectedGuide={selectedGuide}
        onGuideChange={handleGuideChange}
        isShuffled={isShuffled}
        onToggleShuffle={() => { setIsShuffled((s: boolean) => !s); setCurrentIndex(0); setIsFlipped(false); }}
        onReset={handleReset}
        difficulty={difficulty}
        onDifficultyChange={(level) => { setDifficulty(level); setCurrentIndex(0); setIsFlipped(false); setScore({ knew: 0, learning: 0 }); setReviewed(new Set()); }}
        currentIndex={currentIndex}
        total={total}
        score={score}
        progress={progress}
      />

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
                  <div className="flash-face min-h-[18rem] relative">
                    {/* Bookmark button */}
                    <button
                      aria-label={isBookmarked(`quiz__${currentQuestion.id}`) ? 'Remove bookmark' : 'Bookmark this question'}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        toggleBookmark({ id: `quiz__${currentQuestion.id}`, questionId: currentQuestion.id, questionText: currentQuestion.question.slice(0, 100), guideName: currentQuestion.guide, type: 'quiz' });
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-amber-500 transition-colors"
                    >
                      {isBookmarked(`quiz__${currentQuestion.id}`) ? <BookmarkCheck size={18} className="text-amber-500 fill-amber-500" /> : <Bookmark size={18} />}
                    </button>
                    <div className="flash-head pr-8">
                      <span className="flash-label">Question</span>
                      {currentQuestion.guide && <span className="flash-meta">{currentQuestion.guide}</span>}
                      {currentQuestion.difficulty && (
                        <span className={[
                          "text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize",
                          currentQuestion.difficulty === 'beginner' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" :
                          currentQuestion.difficulty === 'intermediate' ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400" :
                          "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                        ].join(' ')}>
                          {currentQuestion.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 quiz-markdown text-lg">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={calloutComponents}>
                        {currentQuestion.question}
                      </ReactMarkdown>
                    </div>
                    <p className="flash-hint">Tap to reveal the answer</p>
                  </div>
                ) : (
                  /* Answer Side */
                  <div className="flash-face flash-face-answer min-h-[18rem]">
                    <div className="flash-head">
                      <span className="flash-label">Answer</span>
                    </div>
                    <div className="flex-1 quiz-markdown overflow-auto max-h-[50vh]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={calloutComponents}>
                        {currentQuestion.answer}
                      </ReactMarkdown>
                    </div>
                    <p className="flash-hint">Tap to see the question</p>
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-line disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink/5 transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isFlipped && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScore(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
            >
              <ThumbsDown size={14} /> Study Again
            </button>
            <button
              onClick={() => handleScore(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
            >
              <ThumbsUp size={14} /> Got It
            </button>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={currentIndex >= total - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-line disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink/5 transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Completion */}
      {reviewed.size === total && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky-note mt-10 p-7 text-center"
        >
          <h3 className="font-display text-2xl font-semibold mb-2">Quiz complete</h3>
          <p className="text-muted mb-4">
            You reviewed all {total} questions.
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold"> {score.knew} knew</span>,
            <span className="text-amber-800 dark:text-amber-400 font-semibold"> {score.learning} to review</span>.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-accent-contrast font-medium hover:bg-accent-strong transition-colors"
          >
            <RotateCcw size={16} /> Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
