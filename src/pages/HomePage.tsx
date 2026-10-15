import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, RotateCcw, Terminal, Atom, Database, GraduationCap, ScrollText, ArrowRight, Flame, Timer, ChevronDown, Globe, BriefcaseBusiness } from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import type { MenuSection, MenuItem } from '../data';
import { menuStructure, cheatSheets, readMinFor, totalQuestionCount } from '../data';
import { useProgress } from '../hooks/useProgress';
import { useStudyStats } from '../hooks/useStudyStats';
import { formatReadTime } from '../lib/formatReadTime';
import { LAST_MINUTE_CARDS } from '../data/lastMinuteCards';
import { cardsFor, readingMinutes } from '../lib/cardSet';

// Hallmark · design-system: design.md · macrostructure: Index-First (study notebook)

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

// lucide has no brand marks in this version: GitHub is the inline GithubIcon, LinkedIn a briefcase.
const DEVELOPER_LINKS = [
  { href: 'https://sreenathp.com/', label: 'Portfolio', Icon: Globe },
  { href: 'https://github.com/sreen98', label: 'GitHub', Icon: GithubIcon },
  { href: 'https://www.linkedin.com/in/sree-nath-p', label: 'LinkedIn', Icon: BriefcaseBusiness },
];

const REQUEST_EMAIL = 'developersreenz@gmail.com';
const REQUEST_MAILTO = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent('PrepHub request')}`;

/** Guides shown per category before "Show all": enough to see what is inside, not a wall. */
const PREVIEW_COUNT = 6;

const JS_GUIDE = '/javascript/guide';

/** Kept outside the component: the purity lint treats Math.random inside one as render-time. */
function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** A real question from the JavaScript guide, answerable right here, on an index card. */
function SampleQuestion() {
  const [open, setOpen] = useState(false);
  return (
    <figure className="card-stack index-card p-6 sm:p-7 lg:-rotate-2">
      <figcaption className="index-card-head flex items-baseline justify-between gap-3 pb-3 mb-4">
        <span className="font-display text-xl font-semibold">What does this return?</span>
        <span className="shrink-0 font-mono text-xs text-muted">JS · Q46</span>
      </figcaption>
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

/** One category as an index card: its name on the red header rule, its guides on the ruled lines. */
function CategoryCard({ cat, getStatus, done }: {
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
    <article className="index-card mb-8 break-inside-avoid px-5 pt-5 pb-4 sm:px-6">
      <header className="index-card-head pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[1.65rem] font-semibold tracking-tight leading-tight">{cat.name}</h3>
          <p className="shrink-0 font-mono text-xs text-muted">
            {cat.items.length} · {formatReadTime(readTime)}
          </p>
        </div>
        <p className="mt-1.5 text-sm text-muted leading-snug line-clamp-2">{cat.description}</p>
        {done > 0 && <p className="mt-1 text-xs font-semibold text-pop-ink">{done} finished</p>}
      </header>
      <ul id={listId}>
        {shown.map(item => {
          const status = getStatus(item.path);
          return (
            <li key={item.path} className="index-card-line min-w-0">
              <Link to={item.path} title={item.name} className="group flex items-baseline gap-2 py-2">
                {status === 'completed' && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 self-center" />}
                {status === 'in-progress' && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-pop shrink-0 self-center" />}
                <span className="min-w-0 truncate font-medium decoration-accent/40 underline-offset-4 group-hover:text-accent group-hover:underline transition-colors">{item.name}</span>
                {status === 'completed' && <span className="sr-only">(finished)</span>}
                {status === 'in-progress' && <span className="sr-only">(in progress)</span>}
                <span aria-hidden="true" className="leader" />
                <span className="shrink-0 font-mono text-xs text-muted tabular-nums">{formatReadTime(readMinFor(item.file))}</span>
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
    navigate(pickRandom(allGuides).path);
  };

  return (
    <div className="text-ink">
      {/* The masthead: a ruled sheet with a margin line, next to a working sample on an index card */}
      <section className="ruled-sheet border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:pl-20 md:pr-12 py-12 md:py-20 grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <div className="min-w-0">
            <h1 className="font-display text-[2.9rem] sm:text-[4rem] lg:text-[5rem] font-semibold tracking-tight leading-[1] mb-7 [overflow-wrap:anywhere]">
              Interview prep for <span className="hl">full-stack</span> developers
            </h1>
            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-xl mb-8">
              From React and Node.js to system design. Read a topic, test yourself on it, and come back to what you missed.
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
            <p className="mt-5 text-sm text-muted">Free, no account needed, and it all runs in your browser.</p>
          </div>
          <SampleQuestion />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">
        {/* The size of the library, as plain numbers rather than a feature grid */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 mb-10">
          {[
            [allGuides.length, 'study guides'],
            [totalQuestionCount, 'interview questions'],
            [LAST_MINUTE_CARDS.length, 'last-minute cards'],
            [cheatSheets.length, 'cheat sheets'],
          ].map(([n, label]) => (
            <div key={label} className="border-l-2 border-accent/50 pl-4">
              <dt className="sr-only">{label}</dt>
              <dd className="font-display text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums leading-none">{n.toLocaleString('en-US')}</dd>
              <dd className="mt-2 font-mono text-xs text-muted">{label}</dd>
            </div>
          ))}
        </dl>

        {/* Progress, from this browser's own data: one quiet strip, not a card */}
        <section aria-labelledby="progress-heading" className="mb-20 border-y border-line py-4">
          {overallStats.completed === 0 && studyStats.totalQuestionsReviewed === 0 ? (
            <p className="text-sm text-muted">
              <span id="progress-heading" className="font-semibold text-ink">Your progress</span> fills in here as you finish guides
              and review questions. It is kept in this browser.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <h2 id="progress-heading" className="font-display text-lg font-semibold">Your progress</h2>
              <div className="flex-1 min-w-[12rem]">
                <div
                  className="h-2 rounded-full bg-ink/10 overflow-hidden"
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
          )}
        </section>

        {/* Guides first: reading is the point; the tools come after */}
        <section id="guides" aria-labelledby="guides-heading" className="scroll-mt-20 mb-20">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-8">
            <h2 id="guides-heading" className="font-display text-5xl sm:text-6xl font-semibold tracking-tight">Study guides</h2>
            <button type="button" onClick={handleRandomTopic} className="text-sm font-semibold text-accent hover:text-accent-strong">
              Open a random guide
            </button>
          </div>
          <div className="lg:columns-2 lg:gap-8">
            {categories.map(cat => (
              <CategoryCard key={cat.name} cat={cat} getStatus={getStatus} done={getCategoryStats(cat.items).completed} />
            ))}
          </div>
        </section>

        {/* Practice tools as sticky notes on the desk */}
        <section aria-labelledby="tools-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-8">
            <h2 id="tools-heading" className="font-display text-5xl sm:text-6xl font-semibold tracking-tight">Practise</h2>
            <p className="text-sm text-muted">Reading is half of it. These make you answer.</p>
          </div>
          <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map(({ to, name, Icon, what }) => (
              <li key={to} className="sticky-note min-w-0">
                <Link to={to} className="group flex h-full flex-col p-5 pb-6">
                  <Icon size={20} aria-hidden="true" className="text-pop-ink" />
                  <span className="mt-3 font-display text-xl font-semibold leading-tight group-hover:text-accent group-hover:underline decoration-accent/40 underline-offset-4">{name}</span>
                  <span className="mt-2 text-sm text-muted leading-snug">{what}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* The developer, as an index card signed at the bottom of the notebook */}
        <section aria-labelledby="developer-heading" className="mt-20">
          <h2 id="developer-heading" className="font-display text-5xl sm:text-6xl font-semibold tracking-tight mb-8">Who built this</h2>
          <div className="index-card max-w-2xl px-6 pt-4 pb-6">
            <p className="index-card-head pb-3 mb-4 font-display text-2xl font-semibold">Sreenath P</p>
            <p className="text-ink leading-relaxed">
              PrepHub is built and maintained by Sreenath P, a frontend software engineer with 5+ years of
              building responsive interfaces in React and TypeScript.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              {DEVELOPER_LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong hover:underline underline-offset-4">
                    <Icon size={15} aria-hidden="true" />
                    {label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sticky-note max-w-2xl mt-8 p-5">
            <h3 className="font-display text-xl font-semibold">Can't find what you need?</h3>
            <p className="mt-2 text-sm text-ink leading-relaxed">
              Missing a topic, a guide or a question you were asked in an interview? Drop a request at{' '}
              <a href={REQUEST_MAILTO} className="font-semibold text-accent hover:text-accent-strong underline underline-offset-4 [overflow-wrap:anywhere]">
                {REQUEST_EMAIL}
              </a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
