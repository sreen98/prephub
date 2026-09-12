import React, { useState, useRef } from 'react';
import { safeSet } from '../../lib/storage';
import { Check, Copy, Play, Timer } from 'lucide-react';


export const PreBlock = ({ children }: { children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLPreElement>(null);

  let language = '';
  React.Children.forEach(children, child => {
    if (React.isValidElement<{ className?: string }>(child)) {
      const match = /language-(\w+)/.exec(child.props?.className || '');
      if (match) language = match[1];
    }
  });

  const isRunnable = ['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx'].includes(language);

  const handleCopy = async () => {
    const text = ref.current?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may not be available */ }
  };

  const handleTryIt = () => {
    let text = ref.current?.textContent || '';
    // Detect JSX broadly: capitalized tag (`<Timer />`), any JSX returned from a function
    // (`return <button>`), React hook usage, or an explicit render call.
    const hasJSX =
      /<[A-Z][A-Za-z0-9]*/.test(text) ||
      /return\s*\(?\s*<[a-zA-Z]/.test(text) ||
      /\b(useState|useEffect|useRef|useMemo|useCallback|useReducer|useContext|useLayoutEffect)\s*\(/.test(text);
    // `render\s*\(` would also match a class method declaration `render() {`.
    // Require a JSX argument: `render(<` so we only count actual top-level calls.
    const hasRender = /(?:^|\n|;)\s*render\s*\(\s*</.test(text) || /ReactDOM\.(render|createRoot)/.test(text);
    if (hasJSX && !hasRender) {
      // Sort by POSITION IN SOURCE, not by which pattern matched. These three
      // matchAll results were previously concatenated and the last element
      // taken, which is the last `const X =` match rather than the last
      // component declared — so `const Child = React.memo(…)` above a
      // `function Parent()` rendered <Child /> with no props and crashed on
      // `data.map`. A reader hit exactly that on the React guide's Q17.
      const matches = [
        ...text.matchAll(/function\s+([A-Z][A-Za-z0-9]*)\s*\(/g),
        ...text.matchAll(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=/g),
        ...text.matchAll(/class\s+([A-Z][A-Za-z0-9]*)\s+extends/g),
      ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      if (matches.length > 0) {
        // The last component declared is the one that composes the others.
        const componentName = matches[matches.length - 1][1];
        text = `${text.replace(/\s+$/, '')}\n\nrender(<${componentName} />);`;
      }
    }
    safeSet('playground-code', text, 'session');
    window.open(`${import.meta.env.BASE_URL}playground`, '_blank');
  };

  return (
    <div className="code-block group">
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <div className="flex items-center gap-2">
          {isRunnable && (
            <button onClick={handleTryIt} className="try-btn">
              <Play size={12} /><span>Try it</span>
            </button>
          )}
          <button onClick={handleCopy} aria-label={copied ? 'Code copied' : 'Copy code'} className="copy-btn">
            {copied
              ? <><Check size={12} /><span>Copied!</span></>
              : <><Copy size={12} /><span>Copy</span></>
            }
          </button>
        </div>
      </div>
      <pre ref={ref} className="code-block-body">
        {children}
      </pre>
    </div>
  );
};

export default PreBlock;
