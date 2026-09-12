import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// ---------------------------------------------------------------------------
// House rules. See the "Enforced code rules" section of CLAUDE.md for the why
// behind each block; every rule here exists because something concrete broke.
//
// The important history: this config used to be `files: ['**/*.{js,jsx}']`
// while every file in src/ is .ts/.tsx, so ESLint linted ZERO application
// files and `eslint-plugin-react-hooks` never ran despite being installed.
// Keep the TS/TSX glob below or the whole gate becomes decorative again.
// ---------------------------------------------------------------------------

/**
 * Files still over the standard size limits.
 *
 * RATCHET — these numbers may only ever go DOWN. If a change pushes a file
 * past its ceiling, shrink the file; do not raise the number. (I raised one by
 * 2 once and had to undo it: the whole point is that the ceiling is a floor on
 * progress.) A file that drops under the standard 400/300 limits should be
 * removed from this list entirely rather than left with a generous ceiling.
 */
const LEGACY_LARGE_FILES = {
  'src/features/playground/CodePlayground.tsx': 920,
}

export default defineConfig([
  globalIgnores(['dist', 'coverage', '.probe-out', 'src/generated']),

  // =========================================================================
  // Application code — TypeScript, type-aware
  // =========================================================================
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ---- Rule 1: no escape hatches around the type system ---------------
      // A cast is how the Review page shipped a blank screen: `getDueQuestions(
      // getAllQuestions() as any)` handed a Promise to something calling
      // .filter(), and `tsc` reported zero errors. Casts hide exactly the
      // class of bug the type checker exists to catch.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off', // too noisy on 3rd-party JSON
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      // Ban the double-cast laundering trick outright.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSAsExpression > TSUnknownKeyword',
          message:
            'No `as unknown as X` double casts. They launder a value past the type checker — this is how a Promise reached .filter() and blanked the Review page. Fix the types (make the function generic, or narrow properly).',
        },
        {
          selector: 'TSAsExpression > TSAnyKeyword',
          message: 'No `as any`. Narrow the type or make the signature generic.',
        },
      ],

      // ---- Rule 2: async correctness --------------------------------------
      // Content is lazy-loaded, so the data layer is async. A forgotten await
      // is the single most likely way to reintroduce the blank-page bug.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',

      // ---- Rule 3: hooks are not advisory ---------------------------------
      // These two are the reason this block exists at all.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // ---- Rule 4: files and functions stay comprehensible ----------------
      // CodePlayground.tsx reached 1,975 lines / 30 useState / a 782-line
      // return, at which point no part of it could be tested. New files must
      // not be born that way; the legacy overrides below are a shrinking debt.
      'max-lines': [
        'error',
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      // 300, not 150: a React component's JSX legitimately runs long. The
      // smell being caught is CodePlayground's 782-line return, not a
      // 190-line page component.
      'max-lines-per-function': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true, IIFEs: false },
      ],
      complexity: ['error', 20],
      'max-depth': ['error', 5],

      // ---- Rule 5: persistence goes through one place ---------------------
      // localStorage THROWS in private mode rather than returning null, so an
      // unguarded read during render unmounts the tree. src/lib/storage.ts is
      // the only module allowed to touch it directly.
      'no-restricted-properties': [
        'error',
        {
          object: 'localStorage',
          message:
            'Use src/lib/storage.ts (safeGet/safeSet). Direct localStorage access throws in private mode and blanks the page.',
        },
        {
          object: 'sessionStorage',
          message: 'Use src/lib/storage.ts (safeSessionGet/safeSessionSet).',
        },
      ],

      // ---- Rule 6: layering (dependencies point downward) -----------------
      // The repo's own Frontend Architecture guide teaches this; enforce it.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/App', '**/App.tsx'],
              message:
                'Nothing may import App. Dependencies point downward: pages → features → components → hooks/lib/data.',
            },
          ],
        },
      ],

      // ---- General hygiene -------------------------------------------------
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          // `typeof import('mermaid')` in a type position is the right way to
          // reference a lazily-imported module's types.
          disallowTypeAnnotations: false,
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // The one module permitted to touch web storage directly.
  {
    files: ['src/lib/storage.ts'],
    rules: { 'no-restricted-properties': 'off' },
  },

  // Content data modules: giant literal arrays by design, and the playground
  // templates deliberately contain `console.log` inside code strings.
  {
    files: ['src/data/**/*.ts'],
    rules: {
      'max-lines': 'off',
      'no-console': 'off',
      'max-lines-per-function': 'off',
    },
  },

  // Tests may use casts to build fixtures and are allowed to be long.
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Ratchet: files that predate `max-lines`. Lower these as they shrink; the
  // pre-push hook fails if a file grows past its recorded ceiling.
  ...Object.entries(LEGACY_LARGE_FILES).map(([file, max]) => ({
    files: [file],
    rules: {
      'max-lines': ['error', { max, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': 'off',
      complexity: 'off',
    },
  })),

  // =========================================================================
  // Build & verification scripts — plain Node JS, no type information
  // =========================================================================
  {
    files: ['scripts/**/*.js', '*.config.js', '*.config.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
