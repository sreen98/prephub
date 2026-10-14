import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/language/typescript/ts.worker?worker';
import React from 'react';
import reactTypes from '../../node_modules/@types/react/index.d.ts?raw';
import reactGlobalTypes from '../../node_modules/@types/react/global.d.ts?raw';
import reactDomTypes from '../../node_modules/@types/react-dom/index.d.ts?raw';
import type { TemplateLang } from '../data/playground/playgroundTemplates';

/**
 * Monaco (the VS Code editor) for the playground. This module is only ever
 * reached through a dynamic import from MonacoCodeEditor, so Monaco, its
 * workers and the React type files all live in lazy chunks that load when a
 * playground opens, never on a guide or the home page.
 *
 * It is bundled, not loaded from a CDN, so the playground keeps working offline
 * under the service worker like the rest of the app.
 */

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    return label === 'typescript' || label === 'javascript' ? new TsWorker() : new EditorWorker();
  },
};

/** VS Code Dark+ token colours on the site's warm near-black playground surface. */
monaco.editor.defineTheme('prephub-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#121110',
    'editorGutter.background': '#121110',
    'editor.lineHighlightBackground': '#1a1917',
    'editor.lineHighlightBorder': '#00000000',
    'editorLineNumber.foreground': '#57534e',
    'editorLineNumber.activeForeground': '#d6d3d1',
    'editorCursor.foreground': '#5ec4b6',
    'editor.selectionBackground': '#0f766e66',
    'editor.inactiveSelectionBackground': '#0f766e33',
    'editorIndentGuide.background1': '#262421',
    'editorIndentGuide.activeBackground1': '#44403c',
    'editorWidget.background': '#1a1917',
    'editorWidget.border': '#36332e',
    'editorSuggestWidget.background': '#1a1917',
    'editorSuggestWidget.border': '#36332e',
    'editorSuggestWidget.selectedBackground': '#0f766e55',
    'editorHoverWidget.background': '#1a1917',
    'editorHoverWidget.border': '#36332e',
    'minimap.background': '#121110',
    'scrollbarSlider.background': '#44403c66',
    'scrollbarSlider.hoverBackground': '#57534e99',
  },
});

// ---------------------------------------------------------------------------
// Types: React, react-dom, and the names the playground injects without imports
// ---------------------------------------------------------------------------

const { typescriptDefaults, javascriptDefaults } = monaco.typescript;

// React's types use csstype for one thing, CSS.Properties (the `style` prop).
// The real file is ~900 KB; a permissive stand-in keeps `style={{…}}` valid.
const CSSTYPE_STUB = 'export interface Properties<TLength = (string & {}) | 0, TTime = string & {}> { [property: string]: any }';

/**
 * Declarations for buildReactScope's names (lib/playgroundScope.ts), DERIVED
 * the same way: from React's runtime exports, so a React upgrade cannot leave a
 * hook that runs but shows a red squiggle.
 */
function scopeDeclarations(): string {
  const names = Object.keys(React).filter((n) => !n.startsWith('__') && n !== 'version');
  return [
    ...names.map((n) => `declare var ${n}: typeof React.${n};`),
    "declare var createPortal: typeof import('react-dom').createPortal;",
    "declare var flushSync: typeof import('react-dom').flushSync;",
    "declare var useFormStatus: typeof import('react-dom').useFormStatus;",
    'declare function render(element: React.ReactNode): void;',
  ].join('\n');
}

for (const defaults of [typescriptDefaults, javascriptDefaults]) {
  defaults.addExtraLib(CSSTYPE_STUB, 'file:///node_modules/csstype/index.d.ts');
  defaults.addExtraLib(reactGlobalTypes, 'file:///node_modules/@types/react/global.d.ts');
  defaults.addExtraLib(reactTypes, 'file:///node_modules/@types/react/index.d.ts');
  defaults.addExtraLib(reactDomTypes, 'file:///node_modules/@types/react-dom/index.d.ts');
  defaults.addExtraLib(scopeDeclarations(), 'file:///playground-scope.d.ts');
  defaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    // 2451/2300: a snippet's own `const useState = …` or `function render` clashes
    // with the injected globals above; the runner allows it, so the editor must too.
    // 1375/1378: top-level await, which the runner supports (it retries as async).
    // 2792/2307: `import … from 'react'` lines, which the runner strips.
    // 8002–8017: TypeScript-only syntax in a .jsx file. The runner transpiles every
    // snippet with the TypeScript preset on, so type annotations in a JS snippet are fine.
    diagnosticCodesToIgnore: [2451, 2300, 1375, 1378, 2792, 2307,
      8002, 8003, 8004, 8005, 8006, 8008, 8009, 8010, 8011, 8012, 8013, 8016, 8017],
  });
}

const BASE_OPTIONS: monaco.typescript.CompilerOptions = {
  target: monaco.typescript.ScriptTarget.ESNext,
  module: monaco.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
  jsx: monaco.typescript.JsxEmit.ReactJSX,
  allowJs: true,
  allowNonTsExtensions: true,
  allowUmdGlobalAccess: true,
  esModuleInterop: true,
  lib: ['esnext', 'dom', 'dom.iterable'],
};

// Plain JS and JSX: completions and hovers, but no type errors (checkJs off),
// because the snippets are untyped JavaScript and would drown in red.
javascriptDefaults.setCompilerOptions({ ...BASE_OPTIONS, checkJs: false });
// TS and TSX: strict, matching the type check that grades TypeScript challenges.
typescriptDefaults.setCompilerOptions({ ...BASE_OPTIONS, strict: true });

/**
 * The model a playground language edits: its file extension decides how TS parses it.
 * Plain JS and JSX share one .jsx model (a JSX parse accepts plain JS), so typing the
 * first tag in a JS snippet never swaps the model out from under the cursor.
 */
export function modelFor(lang: TemplateLang): { uri: string; language: 'javascript' | 'typescript' } {
  if (lang === 'ts') return { uri: 'file:///playground/main.ts', language: 'typescript' };
  if (lang === 'tsx') return { uri: 'file:///playground/main.tsx', language: 'typescript' };
  return { uri: 'file:///playground/main.jsx', language: 'javascript' };
}

export { monaco };
