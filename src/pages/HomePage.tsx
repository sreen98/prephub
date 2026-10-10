import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, RotateCcw, Terminal, Atom, Database, GraduationCap, ScrollText, ArrowRight, Flame } from 'lucide-react';
import type { MenuSection, MenuItem } from '../data';
import { menuStructure, cheatSheets, readMinFor, totalQuestionCount } from '../data';
import { useProgress } from '../hooks/useProgress';
import { useStudyStats } from '../hooks/useStudyStats';
import { formatReadTime } from '../lib/formatReadTime';

// Narrow type-guard so categories that have items keep that fact in TS.
type CategoryWithItems = MenuSection & { items: MenuItem[] };
const hasItems = (s: MenuSection): s is CategoryWithItems => Array.isArray(s.items);

const TOOLS = [
  { to: '/quiz', name: 'Quiz', Icon: Zap, what: 'Answer questions from any guide, then compare with the written answer.' },
  { to: '/review', name: 'Daily Review', Icon: RotateCcw, what: 'Spaced repetition brings back the questions you found hard.' },
  { to: '/playground', name: 'JavaScript Playground', Icon: Terminal, what: 'Coding challenges graded by visible and hidden tests.' },
  { to: '/playground/react', name: 'React Playground', Icon: Atom, what: 'Machine-coding challenges with a live preview and behaviour checks.' },
  { to: '/query-playground', name: 'Query Playground', Icon: Database, what: 'SQL on real PostgreSQL, plus MongoDB, in your browser.' },
  { to: '/interview', name: 'Interview Simulator', Icon: GraduationCap, what: 'A timed mock interview with random questions.' },
  { to: '/cheatsheets', name: 'Cheat Sheets', Icon: ScrollText, what: `${cheatSheets.length} one-page references, from Git to Big-O.` },
];

/** A colour tag per category, so the list is easy to scan. Each pair is AA in its theme. */
const CATEGORY_TAG: Record<string, string> = {
  'Front End': 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  'JS & TS': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  'Back End': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  'AI Engineering': 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  'AI-Augmented Development': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  'DevOps': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  'Git': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  'DSA': 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  'Behavioral': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  'System Design': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
};
const DEFAULT_TAG = 'bg-accent-soft text-accent';

const JS_GUIDE = '/javascript/guide';

/** A real question from the JavaScript guide, answerable right here. */
function SampleQuestion() {
  const [open, setOpen] = useState(false);
  return (
    <figure className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <figcaption className="inline-block rounded-full bg-pop-soft text-pop-ink text-xs font-semibold px-2.5 py-1 mb-3">
        Try one
      </figcaption>
      <p className="font-semibold mb-3">What does this return?</p>
      <pre className="rounded-lg bg-[#22272e] text-[#e6edf3] text-sm px-4 py-3 overflow-x-auto">
        <code>{"['1', '2', '3'].map(parseInt)"}</code>
      </pre>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="sample-answer"
        className="mt-4 px-3.5 py-2 rounded-lg bg-accent-soft text-accent text-sm font-semibold hover:bg-accent/20 transition-colors"
      >
        {open ? 'Hide the answer' : 'Show the answer'}
      </button>
      {open && (
        <div id="sample-answer" className="mt-3 text-sm leading-relaxed">
          <p>
            <code className="font-mono font-semibold">[1, NaN, NaN]</code>. <code className="font-mono">map</code> passes
            each item&apos;s index as a second argument, and <code className="font-mono">parseInt</code> reads it as the
            number base, so <code className="font-mono">&apos;2&apos;</code> is parsed in base 1.
          </p>
          <Link to={JS_GUIDE} className="inline-flex items-center gap-1 mt-2 font-medium text-accent hover:text-accent-strong">
            Read the full answer (Q46) <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </figure>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const categories = menuStructure.filter(hasItems);
  const allGuides: MenuItem[] = menuStructure.flatMap(s => s.items || []);
  const { getOverallStats, getCategoryStats, getStatus, progress } = useProgress();
  const { getStats } = useStudyStats();
  const overallStats = getOverallStats(allGuides);
  const studyStats = getStats();
  const percent = overallStats.total ? Math.round((overallStats.completed / overallStats.total) * 100) : 0;

  // The guide you were last reading and have not finished, if any.
  const continueGuide = allGuides
    .filter(g => progress[g.path]?.status === 'in-progress')
    .sort((a, b) => (progress[b.path]?.lastVisited ?? '').localeCompare(progress[a.path]?.lastVisited ?? ''))[0];

  const handleRandomTopic = () => {
    const random = allGuides[Math.floor(Math.random() * allGuides.length)];
    navigate(random.path);
  };

  return (
    <div className="px-6 py-10 md:px-12 md:py-12 max-w-6xl mx-auto text-ink">
      {/* Introduction, next to a working sample of the product */}
      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-center mb-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
            Interview prep for <span className="text-accent whitespace-nowrap">full-stack</span> developers
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl mb-7">
            {allGuides.length} guides and {totalQuestionCount.toLocaleString('en-US')} interview questions, from React and
            Node.js to system design. Test yourself, review what you missed, and practise in playgrounds that run in your
            browser. Free, with no account.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {continueGuide ? (
              <Link to={continueGuide.path} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-accent-contrast text-sm font-semibold hover:bg-accent-strong transition-colors">
                Continue: {continueGuide.name} <ArrowRight size={16} />
              </Link>
            ) : (
              <a href="#guides" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-accent-contrast text-sm font-semibold hover:bg-accent-strong transition-colors">
                Start studying <ArrowRight size={16} />
              </a>
            )}
            <Link to="/quiz" className="px-5 py-3 rounded-lg border border-line bg-surface text-sm font-semibold hover:border-accent hover:text-accent transition-colors">
              Take a quiz
            </Link>
          </div>
        </div>
        <SampleQuestion />
      </section>

      {/* Progress, from this browser's own data */}
      <section aria-labelledby="progress-heading" className="rounded-xl border border-line bg-surface p-5 mb-12 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <h2 id="progress-heading" className="font-bold">Your progress</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span><span className="font-bold tabular-nums">{studyStats.totalQuestionsReviewed}</span> <span className="text-muted">questions reviewed</span></span>
            {studyStats.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pop-soft text-pop-ink px-2.5 py-1 font-semibold">
                <Flame size={14} aria-hidden="true" /> {studyStats.currentStreak}-day streak
              </span>
            )}
          </div>
        </div>
        <div
          className="h-2.5 rounded-full bg-ink/10 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={overallStats.total}
          aria-valuenow={overallStats.completed}
          aria-label="Guides finished"
        >
          <div className="h-full rounded-full bg-pop" style={{ width: `${Math.max(percent, overallStats.completed ? 2 : 0)}%` }} />
        </div>
        <p className="text-sm text-muted mt-2">
          <span className="font-semibold text-ink tabular-nums">{overallStats.completed}</span> of {overallStats.total} guides finished
        </p>
      </section>

      {/* Practice tools */}
      <section aria-labelledby="tools-heading" className="mb-14">
        <h2 id="tools-heading" className="text-2xl font-bold tracking-tight mb-5">Practice tools</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ to, name, Icon, what }) => (
            <li key={to}>
              <Link to={to} className="group flex gap-3 h-full rounded-xl border border-line bg-surface p-4 hover:border-accent transition-colors">
                <span className="shrink-0 w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold group-hover:text-accent transition-colors">{name}</span>
                  <span className="block text-sm text-muted leading-snug mt-0.5">{what}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Guides, one card per category; CSS columns keep short and long cards from leaving gaps */}
      <section id="guides" aria-labelledby="guides-heading" className="scroll-mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
          <h2 id="guides-heading" className="text-2xl font-bold tracking-tight">Study guides</h2>
          <button type="button" onClick={handleRandomTopic} className="text-sm font-semibold text-accent hover:text-accent-strong">
            Open a random guide
          </button>
        </div>

        <div className="md:columns-2 gap-5">
          {categories.map(cat => {
            const readTime = cat.items.reduce((sum, g) => sum + readMinFor(g.file), 0);
            const done = getCategoryStats(cat.items).completed;
            return (
              <article key={cat.name} className="break-inside-avoid mb-5 rounded-xl border border-line bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold mr-1">{cat.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_TAG[cat.name] ?? DEFAULT_TAG}`}>
                    {cat.items.length} {cat.items.length === 1 ? 'guide' : 'guides'}
                  </span>
                  <span className="text-xs text-muted">{formatReadTime(readTime)}</span>
                  {done > 0 && <span className="text-xs font-semibold text-pop-ink">{done} finished</span>}
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">{cat.description}</p>
                <ul className="flex flex-wrap gap-2">
                  {cat.items.map(item => {
                    const status = getStatus(item.path);
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[13px] font-medium hover:border-accent hover:text-accent transition-colors"
                        >
                          {status === 'completed' && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />}
                          {status === 'in-progress' && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-pop shrink-0" />}
                          {item.name}
                          {status === 'completed' && <span className="sr-only">(finished)</span>}
                          {status === 'in-progress' && <span className="sr-only">(in progress)</span>}
                          <span className="text-[11px] text-muted">{formatReadTime(readMinFor(item.file))}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
