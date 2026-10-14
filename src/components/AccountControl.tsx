import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, LogIn, LogOut, MoreHorizontal, Trash2, X } from 'lucide-react';
import { useAccount } from '../hooks/useAccount';
import { useSync } from '../hooks/useSync';
import type { AccountUser } from '../lib/account';
import { buildExport, exportFileName } from '../lib/exportData';
import { removeSyncedProgress, type SyncStatus } from '../lib/syncEngine';
import DeleteAccountDialog from './DeleteAccountDialog';
import SignOutDialog, { type SignOutChoice } from './SignOutDialog';

const MENU_ITEM = 'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-ink/5 hover:text-ink';

/** "Export my data": this device's progress (kept equal to the account copy) as a JSON file. */
function downloadExport(): void {
  const blob = new Blob([JSON.stringify(buildExport(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName();
  link.click();
  // Revoking in the same tick can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const SYNC_LABEL: Record<SyncStatus, string> = {
  connecting: 'Connecting to your account…',
  syncing: 'Saving to your account…',
  synced: 'Progress synced',
  offline: 'Offline: changes are kept on this device',
  error: "Sync isn't working right now",
};

/** Google profile photo, or the first letter of the name when there is none or it fails to load. */
function Avatar({ user }: { user: AccountUser }) {
  const [broken, setBroken] = useState(false);
  if (user.photoURL && !broken) {
    return (
      <img
        src={user.photoURL}
        alt=""
        width={24}
        height={24}
        // Google's photo host refuses some requests that carry a Referer.
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="h-6 w-6 shrink-0 rounded-full"
      />
    );
  }
  return (
    <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Sign in with Google, in the sidebar footer. Rendered only when
 * ACCOUNTS_ENABLED (lib/account.ts). Signing in is optional: nothing else in
 * the app depends on it.
 */
export default function AccountControl() {
  const { state, busy, error, signIn, signOut } = useAccount();
  const sync = useSync(state.status === 'signed-in' ? state.user.uid : null);
  const [menuOpen, setMenuOpen] = useState(false);
  // The uid is captured on open: deleting the account signs out while the dialog still shows.
  const [dialog, setDialog] = useState<{ kind: 'sign-out' } | { kind: 'delete'; uid: string } | null>(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const openDialog = (next: NonNullable<typeof dialog>): void => {
    setMenuOpen(false);
    setDialog(next);
  };

  const finishSignOut = async (choice: SignOutChoice): Promise<void> => {
    setDialog(null);
    if (!(await signOut())) return;
    // Stop before touching storage: the engine would read removed keys as deletions.
    sync.stop();
    if (choice === 'remove') {
      removeSyncedProgress();
      // Every hook re-reads from storage on a fresh load; simpler and safer than patching each.
      window.location.reload();
    }
  };

  return (
    <div className="pb-2 mb-1 border-b border-line">
      {state.status === 'signed-in' ? (
        <div className="flex items-center gap-2.5 px-3 py-2">
          <Avatar user={state.user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink" title={state.user.email}>{state.user.name}</p>
            <p className="truncate text-[11px] text-muted" aria-live="polite">{SYNC_LABEL[sync.state?.status ?? 'connecting']}</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            disabled={busy}
            aria-label={menuOpen ? 'Hide account options' : 'Account options'}
            aria-expanded={menuOpen}
            aria-controls="account-options"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void signIn()}
          disabled={busy || state.status === 'checking'}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-60"
        >
          <LogIn size={16} />
          <span>{state.status === 'checking' ? 'Checking account…' : busy ? 'Signing in…' : 'Sign in with Google'}</span>
        </button>
      )}
      {state.status === 'signed-out' && (
        // The notice at the point of consent (India's DPDP Act, GDPR Art. 13): what is saved, why, and who may sign in.
        <p className="px-3 pb-1 text-[11px] leading-snug text-muted">
          Optional. Saves your name, email and a copy of your progress to sync between devices; delete it any time.
          18+ in India. <Link to="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy</Link>
        </p>
      )}
      {state.status === 'signed-in' && menuOpen && (
        <ul id="account-options" className="mx-1 mb-1 space-y-0.5">
          <li>
            <button type="button" onClick={() => { setMenuOpen(false); downloadExport(); }} className={MENU_ITEM}>
              <Download size={14} /> Export my data
            </button>
          </li>
          <li>
            <button type="button" onClick={() => openDialog({ kind: 'sign-out' })} className={MENU_ITEM}>
              <LogOut size={14} /> Sign out
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => openDialog({ kind: 'delete', uid: state.user.uid })}
              className={`${MENU_ITEM} text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300`}
            >
              <Trash2 size={14} /> Delete account
            </button>
          </li>
        </ul>
      )}
      {sync.state?.addedLocalProgress && !noticeDismissed && (
        <p className="mx-3 mb-1 flex items-start gap-2 rounded-md bg-accent-soft px-2.5 py-2 text-[11px] text-ink">
          <span className="flex-1">Progress from this device was added to your account.</span>
          <button type="button" onClick={() => setNoticeDismissed(true)} aria-label="Dismiss" className="text-muted hover:text-ink">
            <X size={12} />
          </button>
        </p>
      )}
      {error && (
        <p role="alert" className="px-3 pb-1 text-[11px] text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      {dialog?.kind === 'sign-out' && (
        <SignOutDialog flush={sync.flush} onChoose={(choice) => void finishSignOut(choice)} onCancel={() => setDialog(null)} />
      )}
      {dialog?.kind === 'delete' && (
        <DeleteAccountDialog uid={dialog.uid} stopSync={sync.stop} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
