import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Terminal, GraduationCap, Flame, Clock } from 'lucide-react';
import type { MenuSection, MenuItem } from '../data';
import { menuStructure, readMinFor } from '../data';
import { useProgress } from '../hooks/useProgress';
import { useStudyStats } from '../hooks/useStudyStats';

// Narrow type-guard so categories that have items keep that fact in TS.
type CategoryWithItems = MenuSection & { items: MenuItem[] };
const hasItems = (s: MenuSection): s is CategoryWithItems => Array.isArray(s.items);

// Tailwind class merger (inlined; the App.tsx version is private).
function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function HomePage() {
  const navigate = useNavigate();
  const categories = menuStructure.filter(hasItems);
  const allGuides: MenuItem[] = menuStructure.flatMap(s => s.items || []);
  const { getOverallStats, getCategoryStats, getStatus } = useProgress();
  const { getStats } = useStudyStats();
  const overallStats = getOverallStats(allGuides);
  const studyStats = getStats();

  const handleRandomTopic = () => {
    const random = allGuides[Math.floor(Math.random() * allGuides.length)];
    navigate(random.path);
  };

  return (
    <div className="px-6 py-12 md:px-12 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-14 relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 dark:from-indigo-400/10 dark:via-purple-400/10 dark:to-pink-400/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 border border-indigo-100 dark:border-indigo-900/50">
            <Sparkles size={14} />
            <span>Your interview prep companion</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Master Your Next
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">Interview</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {allGuides.length} comprehensive guides covering full-stack development.
            From React to System Design — everything you need to ace it.
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14"
      >
        <button
          onClick={handleRandomTopic}
          className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-sm font-semibold">Random Topic</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Feeling lucky?</span>
        </button>

        <Link
          to="/quiz"
          className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-sm font-semibold">Quiz Mode</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Test yourself</span>
        </Link>

        <Link
          to="/playground"
          className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <Terminal size={20} className="text-white" />
          </div>
          <span className="text-sm font-semibold">Code Playground</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Run JS code</span>
        </Link>

        <Link
          to="/interview"
          className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-sm font-semibold">Interview Sim</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Mock interview</span>
        </Link>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-6 sm:gap-10 mb-14 py-5 px-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
      >
        {studyStats.currentStreak > 0 && (
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-orange-500 flex items-center justify-center gap-1">
              <Flame size={20} /> {studyStats.currentStreak}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Day Streak</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {overallStats.completed}/{overallStats.total}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {studyStats.totalQuestionsReviewed}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reviewed</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {allGuides.length}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Guides</div>
        </div>
      </motion.div>

      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Study Guides</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pick a category and start learning</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const catReadTime = cat.items.reduce((sum, g) => sum + readMinFor(g.file), 0);
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`h-1 bg-gradient-to-r ${cat.gradient}`} />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn("p-3 rounded-xl shrink-0", cat.lightBg, cat.darkBg)}>
                    {Icon && <Icon className={cat.accent} size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold">{cat.name}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {getCategoryStats(cat.items).completed}/{cat.items.length}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {catReadTime}m
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map(item => {
                    const s = getStatus(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-600 inline-flex items-center gap-1.5"
                      >
                        {s === 'completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                        {s === 'in-progress' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                        {item.name}
                        <span className="text-[10px] text-slate-600 dark:text-slate-400">
                          {readMinFor(item.file)}m
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
