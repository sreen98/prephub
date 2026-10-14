import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import type * as Monaco from 'monaco-editor';
import type { TemplateLang } from '../../data/playground/playgroundTemplates';

type MonacoSetup = typeof import('../../lib/monacoSetup');

/**
 * The playground's editor on desktop: Monaco, the editor inside VS Code, with
 * IntelliSense from the real React types, hovers, errors as you type,
 * multi-cursor (Alt+click, Ctrl/Cmd+D), find and replace, folding, the minimap
 * and VS Code's shortcuts.
 *
 * The value stays controlled by CodePlayground, so drafts, templates, Reset and
 * Format work unchanged. Until Monaco's chunk arrives (or if it fails to load),
 * `fallback`, the lightweight editor, is shown instead, so typing never waits.
 */
export default function MonacoCodeEditor({ value, onChange, lang, wordWrap, autoClose, onRun, onFormat, fallback }: {
  value: string;
  onChange: (value: string) => void;
  lang: TemplateLang;
  wordWrap: boolean;
  autoClose: boolean;
  onRun: () => void;
  onFormat: () => void;
  fallback: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [setup, setSetup] = useState<MonacoSetup | null>(null);
  const [failed, setFailed] = useState(false);

  // Read the latest props from inside Monaco's listeners without re-creating it.
  const emitChange = useEffectEvent((next: string) => { if (next !== value) onChange(next); });
  const run = useEffectEvent(() => onRun());
  const format = useEffectEvent(() => onFormat());
  const currentValue = useEffectEvent(() => value);

  useEffect(() => {
    let alive = true;
    import('../../lib/monacoSetup')
      .then((mod) => { if (alive) setSetup(mod); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  // Create the editor once Monaco has loaded.
  useEffect(() => {
    const host = hostRef.current;
    if (!setup || !host) return;
    const { monaco } = setup;
    const editor = monaco.editor.create(host, {
      model: null,
      theme: 'prephub-dark',
      automaticLayout: true,
      fontFamily: '"Fira Code", "Cascadia Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontLigatures: true,
      fontSize: 14,
      lineHeight: 22,
      tabSize: 2,
      insertSpaces: true,
      padding: { top: 12, bottom: 12 },
      minimap: { enabled: true, renderCharacters: false, maxColumn: 80 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'all',
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: 'active', indentation: true },
      stickyScroll: { enabled: true },
      // Suggestion and hover widgets escape the panel instead of being clipped by it.
      fixedOverflowWidgets: true,
      suggest: { preview: true, showStatusBar: true },
      quickSuggestions: { other: true, comments: false, strings: false },
      formatOnPaste: false,
      'semanticHighlighting.enabled': true,
    });
    editorRef.current = editor;
    // The playground's own shortcuts. Monaco swallows the keys it handles, so the
    // window-level Ctrl/Cmd+Enter listener would never see them from in here.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => format());
    const sub = editor.onDidChangeModelContent(() => emitChange(editor.getValue()));
    return () => {
      sub.dispose();
      editor.getModel()?.dispose();
      editor.dispose();
      editorRef.current = null;
    };
  }, [setup]);

  // One model per language: its file extension tells the TypeScript service how to parse it.
  useEffect(() => {
    const editor = editorRef.current;
    if (!setup || !editor) return;
    const { monaco, modelFor } = setup;
    const { uri, language } = modelFor(lang);
    const target = monaco.Uri.parse(uri);
    const model = monaco.editor.getModel(target) ?? monaco.editor.createModel(currentValue(), language, target);
    if (model.getValue() !== currentValue()) model.setValue(currentValue());
    const previous = editor.getModel();
    if (previous !== model) {
      editor.setModel(model);
      previous?.dispose();
    }
  }, [setup, lang]);

  // A change from outside the editor (template, Reset, Format, resume): push it in
  // as one undoable edit, so Ctrl+Z can still go back past a Format.
  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model || model.getValue() === value) return;
    // Stack boundaries on both sides make it ONE undo step of its own; without them
    // Monaco merges it into the user's last typing, and Ctrl+Z undoes both together.
    model.pushStackElement();
    model.pushEditOperations([], [{ range: model.getFullModelRange(), text: value }], () => null);
    model.pushStackElement();
  }, [value]);

  useEffect(() => {
    editorRef.current?.updateOptions({
      wordWrap: wordWrap ? 'on' : 'off',
      autoClosingBrackets: autoClose ? 'languageDefined' : 'never',
      autoClosingQuotes: autoClose ? 'languageDefined' : 'never',
      autoClosingOvertype: autoClose ? 'auto' : 'never',
    });
  }, [wordWrap, autoClose, setup]);

  if (failed) return <>{fallback}</>;
  return (
    <div className="relative h-full min-h-[200px]">
      <div ref={hostRef} className="absolute inset-0" data-testid="monaco-host" />
      {!setup && <div className="absolute inset-0 z-10 overflow-auto bg-[#121110]">{fallback}</div>}
    </div>
  );
}
