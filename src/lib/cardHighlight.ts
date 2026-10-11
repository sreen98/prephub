// Highlighting for the last-minute cards: the playground's JS/TS/XML grammars
// plus CSS. CSS is registered here, not in editorHighlight.ts, so the
// playground chunk doesn't carry a grammar it never uses.
import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import { highlightCode } from './editorHighlight';

hljs.registerLanguage('css', css);

export { highlightCode };
