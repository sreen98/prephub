/** @type {import('tailwindcss').Config} */

/** A design token defined as an RGB triple in index.css, so `/opacity` modifiers still work. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // System fonts: readable everywhere, and no font download before first paint.
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        // Headings and the wordmark: Fraunces, the one self-hosted web font (index.css
        // @font-face, font-display: swap). Until it lands, the installed serifs stand in.
        display: ['"Fraunces Variable"', '"Iowan Old Style"', 'Charter', '"Sitka Text"', 'Cambria', 'Georgia', 'serif'],
      },
      // The palette. Values (and their dark-mode versions) live in :root / .dark in index.css.
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        accent: {
          DEFAULT: token('accent'),
          strong: token('accent-strong'),
          soft: token('accent-soft'),
          contrast: token('accent-contrast'),
        },
        pop: {
          DEFAULT: token('pop'),
          ink: token('pop-ink'),
          soft: token('pop-soft'),
        },
        highlight: token('highlight'),
        // Notebook decoration only (ruled lines, the margin line): never a text colour.
        rule: token('rule'),
        margin: token('margin'),
      },
    },
  },
  plugins: [],
}
