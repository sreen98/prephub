import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalShellProps {
  titleId: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Overlay + labelled dialog for the account dialogs. Portalled to <body>: the
 * sidebar is transformed on mobile, which would trap a fixed overlay inside it.
 * The caller focuses the safest button when it opens.
 */
export default function ModalShell({ titleId, title, onClose, children }: ModalShellProps) {
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="index-card w-full max-w-md p-5 text-ink"
      >
        <h2 id={titleId} className="index-card-head pb-2 mb-1 font-display text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
