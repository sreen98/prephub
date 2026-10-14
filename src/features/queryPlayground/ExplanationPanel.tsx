import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen } from 'lucide-react';
import type { QueryQuestion } from '../../data/queries/types';

/**
 * The reference solution, the explanation, the MySQL dialect note and the
 * interviewer follow-up. Extracted from QueryPlayground: five independent
 * conditionals in one place were most of that component's complexity.
 */
export default function ExplanationPanel({
  question, showSolution, showExplanation, onShowExplanation,
}: {
  question: QueryQuestion;
  showSolution: boolean;
  showExplanation: boolean;
  onShowExplanation: () => void;
}) {
  if (!showSolution && !showExplanation) return null;

  return (
    <div className="shrink-0 max-h-[42vh] overflow-y-auto border-t border-[#262421] bg-[#141311] px-5 py-4">
      {showSolution && (
        <>
          <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Reference solution</h3>
          <pre className="text-[13px] font-mono bg-[#1a1917] border border-[#262421] rounded-xl p-3 overflow-x-auto text-stone-200">
            {question.solution}
          </pre>
        </>
      )}

      {showExplanation ? (
        <div className="mt-4">
          <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Explanation</h3>
          <div className="quiz-markdown text-[14px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.explanation}</ReactMarkdown>
          </div>

          {question.mysqlNote && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-sky-950/30 border border-sky-900/50 text-[13px] text-sky-300">
              <strong>On MySQL:</strong>
              <div className="quiz-markdown inline-block ml-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.mysqlNote}</ReactMarkdown>
              </div>
            </div>
          )}

          {question.followUp && (
            <p className="mt-3 text-[13px] text-teal-300 flex items-start gap-2">
              <BookOpen size={14} className="mt-0.5 shrink-0" />
              <span><strong>Follow-up an interviewer would ask:</strong> {question.followUp}</span>
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={onShowExplanation}
          className="mt-3 text-[13px] text-teal-300 hover:text-teal-300"
        >
          Show explanation →
        </button>
      )}
    </div>
  );
}
