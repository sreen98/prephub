import Editor from 'react-simple-code-editor';
import { highlightCode, decorateBrackets } from '../../lib/editorHighlight';

/**
 * The lightweight textarea editor: highlight.js colouring over a plain textarea.
 * It is the playground's editor on phones and touch tablets (Monaco is built for
 * a mouse and keyboard), in the tests, and for the moment before Monaco loads.
 * Its keystroke rules (auto-indent, bracket auto-close) live in
 * playgroundAutoClose.ts and arrive here as `onKeyDown`.
 */
export default function SimpleCodeEditor({ code, onChange, onKeyDown, hljsLang, caretPos }: {
  code: string;
  onChange: (code: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => void;
  hljsLang: string;
  caretPos: number;
}) {
  return (
    <Editor
      value={code}
      onValueChange={onChange}
      onKeyDown={onKeyDown}
      highlight={(c) => decorateBrackets(highlightCode(c, hljsLang), c, caretPos)}
      padding={16}
      tabSize={2}
      insertSpaces={true}
      textareaId="playground-editor"
      textareaClassName="playground-editor-textarea"
      preClassName="playground-editor-pre"
      style={{
        fontFamily: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 14,
        lineHeight: 1.6,
        color: '#cdd6f4',
        caretColor: '#fff',
        minHeight: '100%',
      }}
    />
  );
}
