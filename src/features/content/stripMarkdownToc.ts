// Guides embed their own "## Table of Contents" section; the app renders a
// live one instead, so the markdown copy is stripped before rendering.

export function stripMarkdownToc(md: string): string {
  return md.replace(/^## Table of Contents\n[\s\S]*?(?=\n---\s*\n|\n## )/m, '');
}
