import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Lock, KeyRound, LogOut } from 'lucide-react';
import { safeGet, safeSet, safeRemove } from '../lib/storage';

// Passcode-gated personal section, available in LOCAL DEVELOPMENT ONLY.
//
// The document lives at `private/admin-prep.md` — outside src/, and gitignored.
// The deploy workflow builds from `actions/checkout`, so CI never has the file
// and this glob resolves to an empty object in any published build. The route
// itself is also dev-gated in App.tsx, so neither the passcode nor the content
// reaches a production bundle.
//
// Why it's arranged this way: this is a static site with no backend, so ANY
// content reachable by the bundler is served to every visitor in plain text.
// A passcode cannot gate content — only absence from the build can.
// Do not move this file back under src/content/.

const privateDocs = import.meta.glob<string>('/private/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const PASSCODE = '5713';
const SESSION_KEY = 'admin-unlocked';
const PRIVATE_DOC = '/private/admin-prep.md';

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState<boolean>(() =>
    safeGet(SESSION_KEY, 'session') === '1'
  );
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const content = useMemo(
    () =>
      privateDocs[PRIVATE_DOC] ||
      '_Not available in this build — `private/admin-prep.md` is untracked and local-only._',
    [],
  );

  function attempt(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSCODE) {
      safeSet(SESSION_KEY, '1', 'session');
      setUnlocked(true);
      setError('');
      setInput('');
    } else {
      setError('Incorrect passcode');
      setInput('');
    }
  }

  function lock() {
    safeRemove(SESSION_KEY, 'session');
    setUnlocked(false);
  }

  // Auto-focus the passcode input when locked
  useEffect(() => {
    if (!unlocked) {
      const el = document.getElementById('admin-passcode-input') as HTMLInputElement | null;
      el?.focus();
    }
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-4">
              <Lock size={26} />
            </div>
            <h1 className="text-xl font-bold mb-1">Admin Area</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the passcode to view this section.
            </p>
          </div>
          <form onSubmit={attempt} className="space-y-3">
            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none"
              />
              <input
                id="admin-passcode-input"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                placeholder="Passcode"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-400 dark:focus:border-indigo-600 transition-colors text-base tracking-widest"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 md:px-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium">
            <Lock size={11} />
            Admin
          </span>
          <span className="text-slate-500 dark:text-slate-400">Personal interview prep</span>
        </div>
        <button
          onClick={lock}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Lock and clear session"
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
