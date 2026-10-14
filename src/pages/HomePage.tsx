import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, RotateCcw, Terminal, Atom, Database, GraduationCap, ScrollText, ArrowRight, Flame, Timer, ChevronDown } from 'lucide-react';
import type { MenuSection, MenuItem } from '../data';
import { menuStructure, cheatSheets, readMinFor, totalQuestionCount } from '../data';
import { useProgress } from '../hooks/useProgress';
import { useStudyStats } from '../hooks/useStudyStats';
import { formatReadTime } from '../lib/formatReadTime';
import { LAST_MINUTE_CARDS } from '../data/lastMinuteCards';
import { cardsFor, readingMinutes } from '../lib/cardSet';

const CORE_CARDS = cardsFor(LAST_MINUTE_CARDS, 'core').length;

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
  { to: '/last-minute', name: 'Last-Minute Cards', Icon: Timer, what: `${CORE_CARDS} flip cards to refresh the essentials in about ${readingMinutes(CORE_CARDS)} minutes, or all ${LAST_MINUTE_CARDS.length}.` },
  { to: '/cheatsheets', name: 'Cheat Sheets', Icon: ScrollText, what: `${cheatSheets.length} one-page references, from Git to Big-O.` },
];

/** Guides shown per category before "Show all": enough to see what is inside, not a wall. */
const PREVIEW_COUNT = 6;

const JS_GUIDE = '/javascript/guide';

/** A real question from the JavaScript guide, answerable right here. */
function SampleQuestion() {
  const [open, setOpen] = useState(false);
  return (
    <figure className="rounded-lg border border-line bg-surface p-6">
      <figcaption className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Try one
      </figcaption>
      <p className="font-display text-xl font-semibold mb-4">What does this return?</p>
      <pre className="rounded-md bg-[#22272e] text-[#e6edf3] text-sm px-4 py-3 overflow-x-auto">
        <code>{"['1', '2', '3'].map(parseInt)"}</code>
      </pre>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="sample-answer"
        className="mt-4 px-3.5 py-2 rounded-md border border-accent/40 text-accent text-sm font-semibold hover:bg-accent-soft transition-colors"
      >
        {open ? 'Hide the answer' : 'Show the answer'}
      </button>
      {open && (
        <div id="sample-answer" className="mt-4 text-sm leading-relaxed">
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

/** One category: its name and size on the left, its guides as a plain list on the right. */
function CategoryRow({ cat, getStatus, done }: {
  cat: CategoryWithItems;
  getStatus: (path: string) => string;
  done: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const readTime = cat.items.reduce((sum, g) => sum + readMinFor(g.file), 0);
  const hidden = cat.items.length - PREVIEW_COUNT;
  const shown = expanded || hidden <= 0 ? cat.items : cat.items.slice(0, PREVIEW_COUNT);
  const listId = `guides-${cat.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

  return (
    <article className="grid gap-4 md:grid-cols-[16rem_1fr] md:gap-10 py-8 border-t border-line">
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight">{cat.name}</h3>
        <p className="mt-1 text-sm text-muted">
          {cat.items.length} {cat.items.length === 1 ? 'guide' : 'guides'} · {formatReadTime(readTime)}
          {done > 0 && <span className="text-pop-ink font-semibold"> · {done} finished</span>}
        </p>
        <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">{cat.description}</p>
      </div>
      <div>
        <ul id={listId} className="grid gap-x-8 sm:grid-cols-2">
          {shown.map(item => {
            const status = getStatus(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="group flex items-baseline gap-2 py-2 border-b border-line/70 hover:border-accent transition-colors"
                >
                  {status === 'completed' && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 self-center" />}
                  {status === 'in-progress' && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-pop shrink-0 self-center" />}
                  <span className="font-medium group-hover:text-accent transition-colors">{item.name}</span>
                  {status === 'completed' && <span className="sr-only">(finished)</span>}
                  {status === 'in-progress' && <span className="sr-only">(in progress)</span>}
                  <span className="ml-auto shrink-0 text-xs text-muted tabular-nums">{formatReadTime(readMinFor(item.file))}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            aria-controls={listId}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-strong"
          >
            {expanded ? 'Show fewer' : `Show all ${cat.items.length} guides`}
            <ChevronDown size={15} aria-hidden="true" className={expanded ? 'rotate-180' : undefined} />
          </button>
        )}
      </div>
    </article>
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
    <div className="px-6 py-12 md:px-12 md:py-16 max-w-6xl mx-auto text-ink">
      {/* Introduction, next to a working sample of the product */}
      <section className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-center mb-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
            Free · no account · runs in your browser
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
            Interview prep for <em className="text-accent">full-stack</em> developers
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl mb-8">
            {allGuides.length} guides and {totalQuestionCount.toLocaleString('en-US')} interview questions, from React and
            Node.js to system design. Read a topic, test yourself on it, and come back to what you missed.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {continueGuide ? (
              <Link to={continueGuide.path} className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-accent text-accent-contrast text-sm font-semibold hover:bg-accent-strong transition-colors">
                Continue: {continueGuide.name} <ArrowRight size={16} />
              </Link>
            ) : (
              <a href="#guides" className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-accent text-accent-contrast text-sm font-semibold hover:bg-accent-strong transition-colors">
                Start studying <ArrowRight size={16} />
              </a>
            )}
            <Link to="/quiz" className="px-5 py-3 rounded-md border border-line bg-surface text-sm font-semibold hover:border-accent hover:text-accent transition-colors">
              Take a quiz
            </Link>
          </div>
        </div>
        <SampleQuestion />
      </section>

      {/* Progress, from this browser's own data: one quiet strip, not a card */}
      <section aria-labelledby="progress-heading" className="border-y border-line py-5 mb-16">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <h2 id="progress-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">Your progress</h2>
          <div className="flex-1 min-w-[12rem]">
            <div
              className="h-1.5 rounded-full bg-ink/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={overallStats.total}
              aria-valuenow={overallStats.completed}
              aria-label="Guides finished"
            >
              <div className="h-full rounded-full bg-pop" style={{ width: `${Math.max(percent, overallStats.completed ? 2 : 0)}%` }} />
            </div>
          </div>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink tabular-nums">{overallStats.completed}</span> of {overallStats.total} guides finished
          </p>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink tabular-nums">{studyStats.totalQuestionsReviewed}</span> questions reviewed
          </p>
          {studyStats.currentStreak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pop-soft text-pop-ink px-2.5 py-1 text-sm font-semibold">
              <Flame size={14} aria-hidden="true" /> {studyStats.currentStreak}-day streak
            </span>
          )}
        </div>
      </section>

      {/* Guides first: reading is the point; the tools come after */}
      <section id="guides" aria-labelledby="guides-heading" className="scroll-mt-20 mb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <h2 id="guides-heading" className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Study guides</h2>
          <button type="button" onClick={handleRandomTopic} className="text-sm font-semibold text-accent hover:text-accent-strong">
            Open a random guide
          </button>
        </div>
        {categories.map(cat => (
          <CategoryRow key={cat.name} cat={cat} getStatus={getStatus} done={getCategoryStats(cat.items).completed} />
        ))}
      </section>

      {/* Practice tools: a plain list with dividers, not a grid of identical cards */}
      <section aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-6">Practise</h2>
        <ul className="grid gap-x-10 md:grid-cols-2 border-t border-line">
          {TOOLS.map(({ to, name, Icon, what }) => (
            <li key={to}>
              <Link to={to} className="group flex items-start gap-4 py-5 border-b border-line">
                <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-muted group-hover:text-accent transition-colors" />
                <span className="flex-1">
                  <span className="block font-semibold group-hover:text-accent transition-colors">{name}</span>
                  <span className="block text-sm text-muted leading-snug mt-1">{what}</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" className="mt-1 shrink-0 text-muted group-hover:text-accent transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
