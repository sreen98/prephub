import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type SignOutChoice = 'keep' | 'remove';

interface SignOutDialogProps {
  /** Push this device's latest changes; resolves true when the account has everything. */
  flush: () => Promise<boolean>;
  onChoose: (choice: SignOutChoice) => void;
  onCancel: () => void;
}

/**
 * Asked on every sign-out (docs/accounts-and-sync-plan.md, decision 3): keep
 * this device's progress, or remove it. Removing is offered only once the
 * account is confirmed to hold everything, so it can never lose work.
 * Portalled to <body>: the sidebar is transformed on mobile, which would trap
 * a fixed overlay inside it.
 */
export default function SignOutDialog({ flush, onChoose, onCancel }: SignOutDialogProps) {
  const [saved, setSaved] = useState<'saving' | 'saved' | 'failed'>('saving');
  const keepButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    keepButton.current?.focus();
    let live = true;
    flush()
      .then((ok) => { if (live) setSaved(ok ? 'saved' : 'failed'); })
      .catch(() => { if (live) setSaved('failed'); });
    return () => { live = false; };
  }, [flush]);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        className="w-full max-w-md rounded-xl border border-line bg-surface p-5 text-ink shadow-2xl"
      >
        <h2 id="sign-out-title" className="font-display text-lg font-semibold">Sign out</h2>
        <p className="mt-1 text-sm text-muted">What should happen to your progress on this device?</p>

        <div className="mt-4 space-y-2">
          <button
            ref={keepButton}
            type="button"
            onClick={() => onChoose('keep')}
            className="w-full rounded-lg border border-line px-4 py-3 text-left transition-colors hover:bg-ink/5"
          >
            <span className="block text-sm font-medium">Keep it on this device</span>
            <span className="block text-xs text-muted">It stays here, and is added to whichever account signs in next on this device.</span>
          </button>
          <button
            type="button"
            onClick={() => onChoose('remove')}
            disabled={saved !== 'saved'}
            className="w-full rounded-lg border border-line px-4 py-3 text-left transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <span className="block text-sm font-medium">Remove it from this device</span>
            <span className="block text-xs text-muted">For a shared computer. Your account keeps a copy: sign in again to get it back.</span>
          </button>
        </div>

        <p aria-live="polite" className="mt-3 min-h-[1rem] text-xs text-muted">
          {saved === 'saving' && 'Saving your latest changes to your account…'}
          {saved === 'saved' && 'All your progress is saved in your account.'}
          {saved === 'failed' && "Some changes haven't reached your account yet, so removing them now would lose them. Keep them, or try again when you're online."}
        </p>

        <div className="mt-3 flex justify-end">
          <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-sm text-muted hover:bg-ink/5 hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
