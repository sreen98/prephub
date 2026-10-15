// Guides embed their own "## Table of Contents" section; the app renders a
// live one instead, so the markdown copy is stripped before rendering.
// `\r?\n`: a Windows checkout (core.autocrlf=true) serves the guides with CRLF,
// and an LF-only pattern left the inline copy on the page in dev.

export function stripMarkdownToc(md: string): string {
  return md.replace(/^## Table of Contents\r?\n[\s\S]*?(?=\r?\n---\s*\r?\n|\r?\n## )/m, '');
}
