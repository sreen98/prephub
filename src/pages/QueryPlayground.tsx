import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import {
  ArrowLeft, Play, Loader2, CheckCircle2, XCircle, Lightbulb, RotateCcw,
  BookOpen, PanelLeftOpen, Download,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  ALL_QUERY_QUESTIONS, sqlDataset, mongoDataset,
  type QueryQuestion, type QueryEngine, type ResultRow,
} from '../data/queries';
import QuestionList from '../features/queryPlayground/QuestionList';
import ResultPane from '../features/queryPlayground/ResultPane';
import DialectNote from '../features/queryPlayground/DialectNote';
import ExplanationPanel from '../features/queryPlayground/ExplanationPanel';
import { checkAnswer, type CheckResult } from '../features/queryPlayground/checkAnswer';
import { runPostgres, isPostgresReady, type QueryRunResult } from '../features/queryPlayground/engines/postgres';
import { runMongo } from '../features/queryPlayground/engines/mongo';
import { getJSON, setJSON, safeGet, safeSet } from '../lib/storage';
import Toast from '../components/Toast';

hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);

const SOLVED_KEY = 'query-playground-solved';
const DRAFTS_KEY = 'query-playground-drafts';
const ENGINE_KEY = 'query-playground-engine';

export default function QueryPlayground() {
  const [engine, setEngineState] = useState<QueryEngine>(
    () => (safeGet(ENGINE_KEY) === 'mongo' ? 'mongo' : 'postgres'),
  );
  const [question, setQuestion] = useState<QueryQuestion>(() => {
    const first = ALL_QUERY_QUESTIONS.find(
      (q) => q.engine === (safeGet(ENGINE_KEY) === 'mongo' ? 'mongo' : 'postgres'),
    );
    return first ?? ALL_QUERY_QUESTIONS[0];
  });

  const [drafts, setDrafts] = useState<Record<string, string>>(() => getJSON(DRAFTS_KEY, {}));
  const [solved, setSolved] = useState<string[]>(() => getJSON<string[]>(SOLVED_KEY, []));
  const solvedIds = useMemo(() => new Set(solved), [solved]);

  const [code, setCode] = useState<string>(() => {
    const saved = getJSON<Record<string, string>>(DRAFTS_KEY, {});
    const first = ALL_QUERY_QUESTIONS[0];
    return saved[first.id] ?? first.starter ?? '';
  });
  const [result, setResult] = useState<QueryRunResult | null>(null);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showDialect, setShowDialect] = useState(false);

  const dataset = question.engine === 'postgres'
    ? sqlDataset(question.datasetId)
    : undefined;
  const mongoDs = question.engine === 'mongo' ? mongoDataset(question.datasetId) : undefined;

  const selectQuestion = useCallback((q: QueryQuestion) => {
    setQuestion(q);
    setCode(drafts[q.id] ?? q.starter ?? '');
    setResult(null);
    setCheck(null);
    setShowSolution(false);
    setShowExplanation(false);
  }, [drafts]);

  const changeEngine = useCallback((e: QueryEngine) => {
    setEngineState(e);
    safeSet(ENGINE_KEY, e);
    const first = ALL_QUERY_QUESTIONS.find((q) => q.engine === e);
    if (first) selectQuestion(first);
  }, [selectQuestion]);

  // Persist the draft, debounced, so a refresh never loses work.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDrafts((prev) => {
        const next = { ...prev, [question.id]: code };
        setJSON(DRAFTS_KEY, next);
        return next;
      });
    }, 700);
    return () => window.clearTimeout(id);
  }, [code, question.id]);

  const markSolved = useCallback((id: string) => {
    setSolved((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setJSON(SOLVED_KEY, next);
      return next;
    });
  }, []);

  const run = useCallback(async (submit: boolean) => {
    setIsRunning(true);
    setCheck(null);
    // The Postgres engine is ~5 MB and loads on first use; say so rather than
    // leaving the user looking at a spinner with no explanation.
    if (question.engine === 'postgres' && !isPostgresReady()) setEngineLoading(true);

    try {
      const actual = question.engine === 'postgres'
        ? await runPostgres(dataset!.id, dataset!.setup, code)
        : await runMongo(mongoDs!.collections, question.collection!, code);
      setEngineLoading(false);
      setResult(actual);
      if (actual.error || !submit) return;

      const reference = question.engine === 'postgres'
        ? await runPostgres(dataset!.id, dataset!.setup, question.solution)
        : await runMongo(mongoDs!.collections, question.collection!, question.solution);

      const verdict = checkAnswer(actual.rows, reference.rows, question.orderMatters);
      setCheck(verdict);
      if (verdict.correct) {
        markSolved(question.id);
        setShowExplanation(true);
        setToast('Correct — explanation opened below');
      }
    } finally {
      setIsRunning(false);
      setEngineLoading(false);
    }
  }, [question, code, dataset, mongoDs, markSolved]);

  const language = question.engine === 'postgres' ? 'sql' : 'json';
  const highlight = useCallback(
    (src: string) => hljs.highlight(src, { language, ignoreIllegals: true }).value,
    [language],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen bg-[#1c2028] text-slate-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d333b] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => window.dispatchEvent(new Event('prephub:show-sidebar'))}
            className="text-slate-400 hover:text-white hidden md:flex p-1.5 rounded-lg hover:bg-[#2d333b]"
            title="Show sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
          <Link to="/" className="text-slate-400 hover:text-white shrink-0"><ArrowLeft size={16} /></Link>
          <h1 className="text-lg font-bold truncate">Query Playground</h1>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-800/60">
            {question.engine === 'postgres' ? 'PostgreSQL' : 'MongoDB'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowSolution((s) => !s); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b]"
          >
            <Lightbulb size={14} /> {showSolution ? 'Hide' : 'Show'} solution
          </button>
          <button
            onClick={() => { setCode(question.starter ?? ''); setResult(null); setCheck(null); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b]"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={() => void run(true)}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-60"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Run &amp; check
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <aside className="w-[260px] shrink-0 border-r border-[#2d333b] hidden lg:block">
          <QuestionList
            questions={ALL_QUERY_QUESTIONS}
            selectedId={question.id}
            solvedIds={solvedIds}
            engine={engine}
            onEngineChange={changeEngine}
            onSelect={selectQuestion}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-4 border-b border-[#2d333b] shrink-0">
            <h2 className="font-semibold text-white mb-1">{question.title}</h2>
            <p className="text-sm text-slate-300">{question.prompt}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {!question.orderMatters && (
                <p className="text-[11px] text-slate-500">
                  Row order is not checked — only the rows themselves.
                </p>
              )}
              {question.engine === 'postgres' && (
                <button
                  onClick={() => setShowDialect((v) => !v)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline underline-offset-2"
                >
                  Why PostgreSQL and not MySQL?
                </button>
              )}
            </div>

            {showDialect && <DialectNote />}
          </div>

          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <div className="flex-1 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-[#2d333b]">
              <div className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-slate-500 border-b border-[#2d333b]">
                {question.engine === 'postgres' ? 'SQL' : 'Aggregation pipeline (JSON)'}
              </div>
              <div className="flex-1 overflow-auto playground-editor-wrap wrap-on">
                <Editor
                  value={code}
                  onValueChange={setCode}
                  highlight={highlight}
                  padding={16}
                  textareaId="query-editor"
                  className="min-h-full font-mono text-[13px]"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', minHeight: '100%' }}
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 lg:max-w-[48%]">
              <div className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-slate-500 border-b border-[#2d333b] flex items-center justify-between">
                <span>Result</span>
                {result && !result.error && (
                  <span className="text-slate-600 normal-case">
                    {result.rows.length} row{result.rows.length === 1 ? '' : 's'} · {result.elapsedMs.toFixed(0)} ms
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto min-h-0">
                <ResultPane
                  result={result}
                  check={check}
                  engineLoading={engineLoading}
                  sqlDs={dataset}
                  mongoDs={mongoDs}
                />
              </div>
            </div>
          </div>

          <ExplanationPanel
            question={question}
            showSolution={showSolution}
            showExplanation={showExplanation}
            onShowExplanation={() => setShowExplanation(true)}
          />

        </main>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
