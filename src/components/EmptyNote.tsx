import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

/**
 * An empty or finished state, written on a sticky note (design.md): Quiz, Daily Review,
 * Bookmarks and Checkpoints. The icon is decorative; the title carries the meaning.
 */
export default function EmptyNote({ Icon, title, children, actions }: {
  Icon: LucideIcon;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6 py-10 text-center">
      <div className="sticky-note flex flex-col items-center w-full max-w-md px-6 sm:px-8 py-9">
        <Icon size={36} className="text-pop-ink mb-4" aria-hidden="true" />
        <h2 className="font-display text-3xl font-semibold mb-2">{title}</h2>
        <p className="text-muted mb-6 leading-relaxed">{children}</p>
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}

const SECONDARY = 'inline-flex items-center gap-2 px-4 py-2 rounded-md border border-ink/15 bg-surface text-sm font-semibold hover:border-accent hover:text-accent transition-colors';
const PRIMARY = 'inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-contrast text-sm font-semibold hover:bg-accent-strong transition-colors';

/** A link action on a note. `primary` gives it the solid accent fill. */
export function NoteLink({ to, primary = false, children }: { to: string; primary?: boolean; children: ReactNode }) {
  return <Link to={to} className={primary ? PRIMARY : SECONDARY}>{children}</Link>;
}

/** A button action on a note. */
export function NoteButton({ onClick, primary = false, children }: { onClick: () => void; primary?: boolean; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={primary ? PRIMARY : SECONDARY}>{children}</button>;
}
