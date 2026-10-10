import { Link } from 'react-router-dom';
import { cheatSheets } from '../data';

export default function CheatSheetsIndex() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 text-ink">
      <Link to="/" className="inline-block text-sm text-muted hover:text-ink transition-colors mb-4">
        Back to home
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Cheat Sheets</h1>
      <p className="text-muted mb-8 max-w-2xl">
        {cheatSheets.length} one-page references for common interview topics, short enough to scan before an interview
        and to print.
      </p>

      <ul className="grid sm:grid-cols-2 gap-x-10">
        {cheatSheets.map(cs => (
          <li key={cs.path} className="border-t border-line py-4">
            <Link to={cs.path} className="font-semibold hover:text-accent underline-offset-2 hover:underline">
              {cs.name}
            </Link>
            <p className="text-sm text-muted leading-relaxed mt-1">{cs.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
