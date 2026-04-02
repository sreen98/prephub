import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cheatSheets } from '../data';

interface ColorScheme {
  bg: string;
  text: string;
  border: string;
  gradient: string;
}

const colors: Record<string, ColorScheme> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', gradient: 'from-blue-500 to-cyan-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50', gradient: 'from-amber-500 to-orange-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50', gradient: 'from-orange-500 to-red-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50', gradient: 'from-emerald-500 to-teal-400' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/50', gradient: 'from-violet-500 to-purple-400' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/50', gradient: 'from-rose-500 to-pink-400' },
};

export default function CheatSheetsIndex() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 className="text-2xl font-extrabold mb-2">Cheat Sheets</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Quick reference cards for common interview topics. Concise, scannable, printable.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cheatSheets.map((cs: any, i: number) => {
          const c: ColorScheme = colors[cs.color] || colors.blue;
          return (
            <motion.div
              key={cs.path}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={cs.path}
                className={`block p-5 rounded-2xl border ${c.border} bg-white dark:bg-slate-900/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group`}
              >
                <div className={`h-1 rounded-full bg-gradient-to-r ${c.gradient} mb-4 w-12 group-hover:w-20 transition-all`} />
                <div className={`inline-flex p-2 rounded-lg ${c.bg} mb-3`}>
                  <FileText size={18} className={c.text} />
                </div>
                <h3 className="font-bold text-sm mb-1">{cs.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cs.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
