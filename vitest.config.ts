import { defineConfig } from 'vitest/config';

// Standalone config, deliberately NOT merged with vite.config.js: that config's
// `manualChunks` and PWA plugin conflict with Vitest's module runner, and the
// tests need none of it. Running through Vite does mean `import.meta.glob`
// resolves, which is the whole reason the data layer is testable here at all —
// it cannot be imported from plain Node.
export default defineConfig({
  test: {
    environment: 'node',
    // Component smoke tests render with react-dom/server, which needs no DOM.
    // If a test ever needs real DOM APIs, give that file
    // `// @vitest-environment jsdom` rather than switching the whole suite.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: 'dot',
  },
});
