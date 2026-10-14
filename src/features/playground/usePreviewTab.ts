import { useCallback, useEffect, useRef, useState } from 'react';

const ROOT_ID = 'prephub-preview-root';
const TAB_NAME = 'prephub-preview';

/** A blank tab becomes a plain white page with one root element for React to render into. */
function prepareDocument(doc: Document): void {
  if (doc.getElementById(ROOT_ID)) return;
  doc.title = 'Preview · PrepHub';
  doc.body.innerHTML = '';
  doc.body.style.cssText = 'margin:0;padding:16px;background:#fff;color:#1c1917;'
    + 'font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;';
  const host = doc.createElement('div');
  host.id = ROOT_ID;
  doc.body.appendChild(host);
}

/**
 * The React preview in a browser tab of its own, so it can be as big as a real page.
 *
 * The playground opens a blank same-origin tab and React renders the snippet
 * straight into that tab's document (usePreviewMount asks `root()` for its target).
 * That keeps one runner and one console: the code still runs here, logs still land
 * in this console, the behaviour checks still work (they use each element's own
 * document and window), and every Run re-renders the tab. Closing the tab moves the
 * preview back into the pane. The caller re-mounts the preview when isOpen changes.
 */
export function usePreviewTab() {
  const win = useRef<Window | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const root = useCallback((): HTMLElement | null => {
    const w = win.current;
    return w && !w.closed ? w.document.getElementById(ROOT_ID) : null;
  }, []);

  /** Returns false when the browser blocked the new tab. */
  const openTab = useCallback((): boolean => {
    const w = win.current && !win.current.closed ? win.current : window.open('', TAB_NAME);
    if (!w) return false;
    prepareDocument(w.document);
    win.current = w;
    setIsOpen(true);
    w.focus();
    return true;
  }, []);

  const closeTab = useCallback(() => {
    win.current?.close();
    win.current = null;
    setIsOpen(false);
  }, []);

  // A tab can be closed from its own window: notice, and bring the preview home.
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => {
      if (!win.current || win.current.closed) {
        win.current = null;
        setIsOpen(false);
      }
    }, 700);
    return () => window.clearInterval(id);
  }, [isOpen]);

  // Leaving the playground leaves nothing running in an orphaned tab.
  useEffect(() => () => { win.current?.close(); }, []);

  return { isOpen, root, openTab, closeTab };
}

/** Re-mount the preview when the tab opens or closes, so it moves to the new target. Only on a real change. */
export function useRemountOnTabMove(isOpen: boolean, remount: () => Promise<void>): void {
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (wasOpen.current === isOpen) return;
    wasOpen.current = isOpen;
    // Next tick, not inside the effect: an effect can be flushed while React is rendering,
    // and unmounting the old preview root then logs "synchronously unmount … already rendering".
    const id = window.setTimeout(() => { void remount(); }, 0);
    return () => window.clearTimeout(id);
  }, [isOpen, remount]);
}
