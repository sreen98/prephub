// Prettier, loaded on demand. Its three plugins are ~125 KB gzipped, so this
// stays a dynamic import and never enters the playground chunk.
import { detectTS } from './playgroundRunner';

let prettierBundle: { format: (code: string, opts: object) => Promise<string>; plugins: object[] } | null = null;
async function loadPrettier() {
  if (prettierBundle) return prettierBundle;
  const [prettierMod, babelMod, estreeMod, tsMod] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/estree'),
    import('prettier/plugins/typescript'),
  ]);
  prettierBundle = {
    format: prettierMod.format,
    plugins: [
      babelMod.default ?? babelMod,
      estreeMod.default ?? estreeMod,
      tsMod.default ?? tsMod,
    ],
  };
  return prettierBundle;
}

export async function formatCode(source: string, lang: string): Promise<string> {
  const { format, plugins } = await loadPrettier();
  // Pick parser by what the source actually contains, not just by template lang.
  // The `typescript` parser handles both pure TS and TSX (TS + JSX) reliably,
  // while `babel-ts` in Prettier 3's standalone bundle chokes on some generics
  // when JSX is present. `babel` covers plain JS and JSX-without-TS.
  const hasTS = lang === 'ts' || lang === 'tsx' || detectTS(source);
  const parser = hasTS ? 'typescript' : 'babel';
  return format(source, {
    parser,
    plugins,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 80,
    arrowParens: 'always',
    bracketSpacing: true,
  });
}
