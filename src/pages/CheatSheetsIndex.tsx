import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cheatSheets } from '../data';

// Hallmark · design-system: design.md · macrostructure: Index-First (a contents page on a sheet)

export default function CheatSheetsIndex() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 text-ink">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-4">
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 className="page-title mb-3">Cheat <span className="hl">sheets</span></h1>
      <p className="text-lg text-muted mb-8 max-w-2xl">
        {cheatSheets.length} one-page references for common interview topics, short enough to scan before an interview
        and to print.
      </p>

      <div className="paper-sheet rounded-sm px-5 py-6 md:pl-[4.5rem] md:pr-10 md:py-8">
        <ul className="grid md:grid-cols-2 gap-x-12">
          {cheatSheets.map(cs => (
            <li key={cs.path} className="min-w-0 border-b border-rule py-4">
              <Link to={cs.path} className="group block">
                <span className="font-display text-xl font-semibold leading-snug decoration-accent/40 underline-offset-4 group-hover:text-accent group-hover:underline">
                  {cs.name}
                </span>
                <span className="block text-sm text-muted leading-relaxed mt-1">{cs.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
