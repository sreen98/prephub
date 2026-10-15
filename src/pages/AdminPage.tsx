import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Lock, KeyRound, LogOut, Eye, EyeOff } from 'lucide-react';
import { decryptText, isEncryptedDoc } from '../lib/adminCrypto';

// Passphrase-protected personal section.
//
// This is a static site with no backend, so ANY content it ships is public, and
// a passcode checked in the browser cannot gate it. The document is therefore
// published only as AES-GCM ciphertext: `npm run admin:encrypt` turns the
// gitignored `private/admin-prep.md` into `public/admin-prep.enc.json`. This page
// fetches that file and decrypts it in the browser with the passphrase the
// reader types. The passphrase is in no code or config, and the plain text
// exists only in memory while the page is open, so a reload or Lock asks again.
//
// Never import anything from `private/` here: a local `npm run build` would
// bundle the plain text into dist/.

const ENCRYPTED_URL = `${import.meta.env.BASE_URL}admin-prep.enc.json`;
const NOT_PUBLISHED = 'The admin document has not been published yet.';

/** Resolves to the document, or `null` when the passphrase is wrong. */
async function unlock(passphrase: string): Promise<string | null> {
  const res = await fetch(ENCRYPTED_URL, { cache: 'no-cache' });
  if (res.status === 404) throw new Error(NOT_PUBLISHED);
  if (!res.ok) throw new Error(`Could not load the document (HTTP ${res.status}).`);
  let doc: unknown;
  try {
    doc = JSON.parse(await res.text());
  } catch {
    // The dev server answers a missing file with index.html, not a 404.
    throw new Error(NOT_PUBLISHED);
  }
  if (!isEncryptedDoc(doc)) throw new Error('The published document is in an unexpected format.');
  return decryptText(doc, passphrase);
}

export default function AdminPage() {
  const [content, setContent] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function attempt(e: React.FormEvent) {
    e.preventDefault();
    if (checking || !input) return;
    setChecking(true);
    setError('');
    unlock(input)
      .then((text) => {
        if (text === null) setError('Incorrect passphrase');
        else {
          setContent(text);
          setShowPassphrase(false);
        }
        setInput('');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not open the document.');
      })
      .finally(() => setChecking(false));
  }

  function lock() {
    setContent(null);
  }

  // Focus the passphrase input whenever the page is locked
  useEffect(() => {
    if (content === null) inputRef.current?.focus();
  }, [content]);

  if (content === null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="index-card w-full max-w-sm p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-accent-soft text-accent mb-4">
              <Lock size={26} aria-hidden="true" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-1">Admin area</h1>
            <p className="text-sm text-muted">
              Enter the passphrase to view this section.
            </p>
          </div>
          <form onSubmit={attempt} className="space-y-3">
            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                ref={inputRef}
                type={showPassphrase ? 'text' : 'password'}
                autoComplete="current-password"
                aria-label="Passphrase"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                placeholder="Passphrase"
                className="w-full pl-10 pr-11 py-3 rounded-md border border-line bg-surface text-ink outline-none focus:border-accent transition-colors text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase((v) => !v)}
                aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                aria-pressed={showPassphrase}
                title={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-muted hover:text-ink transition-colors"
              >
                {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-400 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={checking}
              className="w-full py-3 rounded-md bg-accent hover:bg-accent-strong disabled:opacity-60 text-accent-contrast text-sm font-semibold transition-colors"
            >
              {checking ? 'Unlocking…' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-sheet px-5 py-8 md:pl-[4.5rem] md:pr-12 md:py-12 md:m-6 md:rounded-sm max-w-5xl md:mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-muted">Admin / Personal interview prep</span>
        </div>
        <button
          onClick={lock}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
          title="Lock and clear the document from memory"
        >
          <LogOut size={13} />
          Lock
        </button>
      </div>
      <div className="prose-container">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
