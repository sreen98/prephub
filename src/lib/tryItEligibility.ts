/**
 * Can this guide code block run in the Code Playground at all?
 *
 * `PreBlock` gives every js/jsx/ts/tsx block a "Try it" button. A mechanical
 * scan of all 199 blocks that Try it auto-renders found that about a quarter of
 * the failures could never be fixed by editing the example, because the
 * playground is a browser sandbox with React and nothing else:
 *
 * - **React Native**: `<View>`, `<Text>`, `StyleSheet` do not exist in a browser.
 * - **Other packages**: the playground strips `import` lines and injects only
 *   React and three react-dom APIs, so `next/navigation`, `react-router-dom`,
 *   `@tanstack/react-query`, `@stripe/…` or Testing Library are simply absent.
 * - **Async Server Components**: an `async function Page()` component only
 *   renders on a server; React throws when a browser tries.
 *
 * A button that is guaranteed to fail is worse than no button, so those blocks
 * get no Try it. Everything else keeps it, and the examples that fail for
 * fixable reasons (a helper defined in another block, missing props) are fixed
 * in the content instead.
 */

/** Packages the playground provides (their imports are stripped and the names injected). */
const PROVIDED = new Set(['react', 'react-dom', 'react-dom/client']);

// Value imports only: `import type` is erased before the code runs, so it needs nothing.
const IMPORT_FROM = /(?:^|\n)\s*import\s+(?!type\s)[^'"\n]*?from\s+['"]([^'"]+)['"]/g;
// Side-effect imports (`import 'x'`). A stylesheet is harmless once the line is stripped.
const IMPORT_BARE = /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g;
const REQUIRE = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Every module the code needs at runtime, in source order. */
export function importedPackages(code: string): string[] {
  const found: string[] = [];
  for (const m of code.matchAll(IMPORT_FROM)) found.push(m[1]);
  for (const m of code.matchAll(IMPORT_BARE)) if (!/\.(css|scss|sass|less)$/.test(m[1])) found.push(m[1]);
  for (const m of code.matchAll(REQUIRE)) found.push(m[1]);
  return found;
}

export function canRunInPlayground(code: string): boolean {
  // Relative imports ('./Button') mean the block is one file of a larger app.
  if (importedPackages(code).some((p) => !PROVIDED.has(p))) return false;

  // React Native primitives, with or without an import line.
  if (/StyleSheet\.create\(|<(View|Text|ScrollView|FlatList|SafeAreaView|TouchableOpacity|Pressable)\b/.test(code)) {
    return false;
  }

  // An async function component is a Server Component: it only renders on a server.
  if (/(?:^|\n)\s*(?:export\s+(?:default\s+)?)?async\s+function\s+[A-Z]\w*\s*\(/.test(code)) return false;
  if (/(?:^|\n)\s*['"]use server['"]/.test(code)) return false;

  return true;
}
