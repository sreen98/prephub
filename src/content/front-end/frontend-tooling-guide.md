# Frontend Tooling — Complete Guide

## Table of Contents

- [1. Do We Need a Bundler for React?](#1-do-we-need-a-bundler-for-react)
- [2. Webpack Deep Dive](#2-webpack-deep-dive)
- [3. Vite Deep Dive](#3-vite-deep-dive)
- [4. Webpack vs Vite Comparison](#4-webpack-vs-vite-comparison)
- [5. Other Bundlers Overview](#5-other-bundlers-overview)
- [6. Package Managers — npm vs yarn vs pnpm](#6-package-managers--npm-vs-yarn-vs-pnpm)
- [7. npx](#7-npx)
- [8. package.json Deep Dive](#8-packagejson-deep-dive)
- [9. Interview Questions & Answers](#9-interview-questions--answers)

---

## 1. Do We Need a Bundler for React?

### 1.1 Can You Use React Without a Bundler?

Technically, yes. You can load React via CDN script tags:

```html
<!-- Load React from CDN — no bundler needed -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

<div id="root"></div>
<script>
  // This works — but you can't use JSX
  const App = () => React.createElement('div', null,
    React.createElement('h1', null, 'Hello World'),
    React.createElement('p', null, 'This is vanilla React without JSX')
  );
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(App)
  );
</script>
```

This works for trivial examples, but in practice it is unusable for real applications. Here is why.

### 1.2 What a Bundler Actually Does

A bundler solves six critical problems that raw browser loading cannot handle:

**Problem 1: JSX Transpilation**

JSX is not valid JavaScript. Browsers cannot parse it. A bundler runs Babel (or SWC/esbuild) to transform JSX into `React.createElement` calls (React 16) or the automatic JSX runtime (React 17+).

```jsx
// What you write (JSX)
const App = () => <div className="app"><h1>Hello</h1></div>;

// What the bundler produces (React 17+ automatic runtime)
import { jsx as _jsx } from 'react/jsx-runtime';
const App = () => _jsx('div', {
  className: 'app',
  children: _jsx('h1', { children: 'Hello' })
});
```

**Problem 2: Module Resolution**

A real React app imports hundreds of modules. Browsers support ES modules via `<script type="module">`, but:

- `import React from 'react'` is a **bare specifier** — browsers do not know how to resolve it. They only understand relative paths (`./foo.js`) or URLs (`https://cdn.com/foo.js`).
- Node-style resolution (`node_modules/react/index.js`) does not exist in browsers.
- A single library like `react-dom` has dozens of internal imports. Loading each one as a separate HTTP request is catastrophically slow.

The bundler resolves all bare specifiers, follows the entire dependency graph, and produces a single (or a few) output file(s).

**Problem 3: Tree Shaking (Dead Code Elimination)**

```js
// You import one function from lodash-es
import { debounce } from 'lodash-es';

// Without tree shaking: entire lodash (~70KB gzipped) ships to the browser
// With tree shaking: only debounce + its dependencies (~1KB) ships
```

Tree shaking uses ES module static analysis — the bundler examines `import`/`export` statements at build time, determines which exports are never used, and removes them. This only works with ES modules (not CommonJS `require()`) because `import`/`export` are statically analyzable.

**Problem 4: Code Splitting**

```js
// Dynamic import — the bundler splits this into a separate chunk
const AdminPanel = React.lazy(() => import('./AdminPanel'));
// AdminPanel chunk only loads when the user navigates to /admin
```

Without a bundler, you would have to manually split your code into separate files and manage loading order yourself.

**Problem 5: Asset Processing**

A bundler handles CSS imports, image imports, font loading, SVG inlining, PostCSS/Sass compilation, and Tailwind CSS processing — none of which browsers can do natively from JavaScript.

```js
import styles from './App.module.css';    // CSS Modules — scoped class names
import logo from './logo.svg';            // Returns URL or inline SVG
import data from './config.json';         // JSON imports
```

**Problem 6: Dev Server & Hot Module Replacement (HMR)**

A dev server provides:
- Automatic recompilation on file save
- Hot Module Replacement — updates modules in-place without full page reload, preserving component state
- Error overlay showing compilation errors in the browser
- Source maps mapping bundled code back to original source

### 1.3 The Build Pipeline

```
Source Files          Transpilation         Bundling            Optimization
─────────────   ──▶  ──────────────  ──▶  ─────────────  ──▶  ────────────────
.jsx/.tsx files       Babel/SWC/esbuild    Resolve imports     Tree shaking
.css/.scss            PostCSS/Sass         Build dep graph     Minification
.svg/.png             Asset pipeline       Merge into chunks   Code splitting
.json                                                          Gzip/Brotli
```

### 1.4 What About Import Maps?

Import maps (supported in all modern browsers since 2023) let you map bare specifiers to URLs:

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18",
    "react-dom/client": "https://esm.sh/react-dom@18/client"
  }
}
</script>
<script type="module">
  import React from 'react';
  // This now works in the browser!
</script>
```

Import maps solve the bare-specifier problem, but you still lose JSX transpilation, tree shaking, code splitting, CSS processing, HMR, and TypeScript support. They are useful for small demos, not production apps.

**Bottom line:** You need a bundler for any React application beyond a trivial demo. The question is not "bundler or no bundler" — it is "which bundler."

---

## 2. Webpack Deep Dive

### 2.1 What is Webpack?

Webpack (first released 2012, v5 since October 2020) is a **static module bundler** for JavaScript applications. It builds a **dependency graph** of every module your project needs and bundles them into one or more output files.

As of 2024, webpack still powers a massive share of production React apps, though Vite is rapidly gaining adoption for new projects.

### 2.2 Core Concepts

Webpack has five core concepts:

```
┌─────────────────────────────────────────────────────────────────┐
│                        webpack.config.js                        │
│                                                                 │
│   Entry ──▶ Module Rules (Loaders) ──▶ Plugins ──▶ Output      │
│     │              │                       │          │         │
│  ./src/index.js   babel-loader          HtmlPlugin  ./dist/    │
│                   css-loader            MiniCss     bundle.js  │
│                   file-loader           Define                  │
│                                                                 │
│   Mode: 'development' | 'production'                           │
│   Devtool: 'source-map' | 'eval-source-map' | ...             │
└─────────────────────────────────────────────────────────────────┘
```

**1. Entry** — The starting point. Webpack begins here and follows every `import`/`require` to build the dependency graph.

**2. Output** — Where to emit the bundled files and what to name them.

**3. Loaders** — Transformations applied to individual files. Webpack natively only understands JS and JSON. Loaders let it process CSS, TypeScript, images, etc.

**4. Plugins** — More powerful than loaders. They hook into the entire compilation lifecycle to perform bundle-level operations (HTML generation, CSS extraction, environment variables, etc.).

**5. Mode** — `development` (readable output, fast builds, detailed errors) or `production` (minified, tree-shaken, optimized).

### 2.3 Basic Configuration

```js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 1. Entry point
  entry: './src/index.js',

  // 2. Output
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',    // contenthash for cache busting
    clean: true,                             // clean dist/ before each build
  },

  // 3. Mode
  mode: 'production',  // or 'development'

  // 4. Loaders
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,           // match file extensions
        exclude: /node_modules/,
        use: 'babel-loader',           // transform with Babel
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],  // loaders run RIGHT to LEFT
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',        // webpack 5 built-in asset modules
      },
    ],
  },

  // 5. Plugins
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // inject bundle into HTML template
    }),
  ],

  // 6. Resolve — configure module resolution
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],  // omit extensions in imports
    alias: {
      '@': path.resolve(__dirname, 'src'),       // import from '@/components/...'
    },
  },
};
```

### 2.4 How Webpack Builds the Dependency Graph

1. Start at the entry point (`./src/index.js`)
2. Parse the file, find all `import` and `require()` statements
3. Resolve each dependency (check `resolve.extensions`, `resolve.alias`, `node_modules`)
4. Apply matching loaders to each file (e.g., `babel-loader` for `.jsx`)
5. Recursively repeat steps 2-4 for each dependency
6. Build a complete dependency graph (a directed acyclic graph of modules)
7. Group modules into **chunks** (based on entry points and dynamic imports)
8. Run plugins on the compilation
9. Write output bundles to `output.path`

### 2.5 Common Loaders

| Loader | Purpose | Example Config |
|---|---|---|
| `babel-loader` | Transpile JS/JSX/TS via Babel | `{ test: /\.jsx?$/, use: 'babel-loader' }` |
| `ts-loader` | Compile TypeScript (alternative to babel-loader) | `{ test: /\.tsx?$/, use: 'ts-loader' }` |
| `css-loader` | Resolve `@import` and `url()` in CSS, returns CSS as JS string | Always paired with style-loader or MiniCssExtract |
| `style-loader` | Inject CSS into DOM via `<style>` tags at runtime | Dev only — not for production |
| `postcss-loader` | Run PostCSS plugins (autoprefixer, Tailwind) | `{ test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] }` |
| `sass-loader` | Compile SCSS/Sass to CSS | Requires `sass` package as peer dependency |
| `file-loader` | Emit file to output directory, return URL (deprecated in webpack 5) | Replaced by `type: 'asset/resource'` |
| `url-loader` | Inline small files as base64 data URLs (deprecated in webpack 5) | Replaced by `type: 'asset'` with `maxSize` |
| `svg-url-loader` | Inline SVGs as data URIs | Better: use `@svgr/webpack` for React components |
| `@svgr/webpack` | Import SVGs as React components | `import { ReactComponent as Logo } from './logo.svg'` |

**Loader execution order matters.** Loaders in the `use` array run **right-to-left** (bottom-to-top):

```js
// For a .scss file, execution order is:
use: [
  'style-loader',    // 3rd: injects CSS into DOM
  'css-loader',      // 2nd: resolves @import and url()
  'sass-loader',     // 1st: compiles SCSS → CSS
]
```

### 2.6 Common Plugins

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    // Generate HTML file with script tags injected
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: { collapseWhitespace: true, removeComments: true },
    }),

    // Extract CSS into separate files (use in production instead of style-loader)
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),

    // Define compile-time constants (replaced during build, NOT at runtime)
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.API_URL': JSON.stringify('https://api.example.com'),
      __DEV__: JSON.stringify(false),
    }),

    // Copy static files to output directory
    new CopyWebpackPlugin({
      patterns: [{ from: 'public/assets', to: 'assets' }],
    }),

    // Visualize bundle contents — generates interactive treemap
    new BundleAnalyzerPlugin(),   // run with ANALYZE=true
  ],

  optimization: {
    minimizer: [
      new TerserPlugin(),           // minify JS (default in production mode)
      new CssMinimizerPlugin(),     // minify CSS
    ],
  },
};
```

### 2.7 Webpack Dev Server

```js
// webpack.config.js
module.exports = {
  devServer: {
    port: 3000,
    hot: true,                     // enable Hot Module Replacement
    open: true,                    // open browser on start
    historyApiFallback: true,      // serve index.html for all 404s (SPA routing)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // proxy API requests to backend
        changeOrigin: true,
      },
    },
    static: {
      directory: path.join(__dirname, 'public'),  // serve static files
    },
    compress: true,                // gzip compression
  },
};
```

```bash
# Install
npm install -D webpack-dev-server

# Run
npx webpack serve
# or via package.json script: "start": "webpack serve --mode development"
```

Webpack Dev Server compiles the entire bundle in memory (not written to disk), serves it via Express, and pushes updates over a WebSocket when files change.

### 2.8 Code Splitting

Three approaches to code splitting in webpack:

**Approach 1: Multiple Entry Points**

```js
module.exports = {
  entry: {
    app: './src/index.js',
    admin: './src/admin.js',
  },
  output: {
    filename: '[name].[contenthash].js',
  },
};
// Produces: app.abc123.js, admin.def456.js
```

**Approach 2: Dynamic Imports (Most Common in React)**

```jsx
import React, { lazy, Suspense } from 'react';

// Each lazy() call creates a separate chunk
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));
const AdminPanel = lazy(() => import(
  /* webpackChunkName: "admin" */    // name the chunk
  /* webpackPrefetch: true */         // prefetch when browser is idle
  './AdminPanel'
));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

**Approach 3: SplitChunks Plugin (Vendor Splitting)**

```js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',                  // split both sync and async chunks
      cacheGroups: {
        // Extract all node_modules into a separate vendor bundle
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Extract React + ReactDOM into their own chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,              // higher priority wins
        },
        // Extract shared code used in 2+ chunks
        common: {
          minChunks: 2,
          name: 'common',
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // Extract webpack runtime into a separate file
    runtimeChunk: 'single',
  },
};
```

### 2.9 Tree Shaking

Tree shaking in webpack requires:

1. **ES modules** — `import`/`export`, not `require()`/`module.exports`
2. **`mode: 'production'`** — enables `TerserPlugin` which removes the dead code
3. **`sideEffects` in package.json** — tells webpack which files are safe to skip

```json
// package.json
{
  "sideEffects": false
  // OR be specific:
  // "sideEffects": ["*.css", "*.global.js"]
}
```

How it works:
1. Webpack marks unused exports during the bundling phase
2. TerserPlugin (in production mode) strips the dead code
3. `sideEffects: false` allows webpack to skip entire modules if none of their exports are used

```js
// math.js
export function add(a, b) { return a + b; }      // USED — kept
export function subtract(a, b) { return a - b; }  // UNUSED — removed
export function multiply(a, b) { return a * b; }  // UNUSED — removed

// app.js
import { add } from './math';
console.log(add(2, 3));
// Production output only includes the `add` function
```

### 2.10 Source Maps

Source maps map bundled/minified code back to original source for debugging.

| Devtool Option | Build Speed | Rebuild Speed | Quality | Use Case |
|---|---|---|---|---|
| `eval` | Fastest | Fastest | Generated code | Development (fast) |
| `eval-source-map` | Slow | Fast | Original source | Development (accurate) |
| `source-map` | Slowest | Slowest | Original source | Production (full maps) |
| `hidden-source-map` | Slowest | Slowest | Original source | Production (maps not linked) |
| `nosources-source-map` | Slowest | Slowest | Lines only | Production (hide source) |
| `cheap-module-source-map` | Medium | Medium | Original source (lines) | Development (balanced) |

```js
module.exports = {
  // Development — fast rebuilds, accurate source mapping
  devtool: 'eval-source-map',

  // Production — full source maps (upload to error tracking, don't ship to users)
  // devtool: 'source-map',
};
```

### 2.11 Create React App and Webpack

Create React App (CRA) was the official React scaffolding tool from 2016 to ~2023. It used webpack under the hood but abstracted all configuration behind `react-scripts`.

```
create-react-app
├── react-scripts          (CLI wrapper)
│   ├── webpack.config.js  (hidden, ~700 lines)
│   ├── babel preset        (babel-preset-react-app)
│   ├── webpack-dev-server  (dev server)
│   ├── jest                (testing)
│   └── eslint              (linting)
└── No webpack.config.js visible to developer
```

What CRA's webpack config included:
- `babel-loader` with preset-env + preset-react + preset-typescript
- `css-loader`, `style-loader`, `postcss-loader` (with autoprefixer)
- CSS Modules support (`.module.css` files)
- `MiniCssExtractPlugin` in production
- `HtmlWebpackPlugin` with template
- `DefinePlugin` with `REACT_APP_*` environment variables
- `splitChunks` for vendor and runtime splitting
- `TerserPlugin` + `CssMinimizerPlugin` in production
- Asset modules for images, fonts, SVGs
- Source maps (eval-source-map in dev, source-map in prod)

**Why CRA fell out of favor:**
- Slow startup — webpack-based dev server rebundles everything on start
- No easy config override — had to `eject` (irreversible) or use `craco`/`react-app-rewired`
- Outdated dependencies — maintenance stalled in 2022
- React team now recommends frameworks (Next.js, Remix) or Vite in the official docs (as of 2024)

---

## 3. Vite Deep Dive

### 3.1 What is Vite?

Vite (French for "fast", pronounced /vit/) was created by Evan You (creator of Vue.js) and released in 2020. It is a **next-generation frontend build tool** that provides a fundamentally different dev experience from webpack.

Current stable version: **Vite 6** (as of late 2024). Used by Vue, React, Svelte, Solid, Astro, and many other frameworks.

### 3.2 How Vite Works — The Key Insight

Vite splits the work into two fundamentally different phases:

```
┌──────────────────────────────────────────────────────┐
│                  DEVELOPMENT                          │
│                                                       │
│  Native ES Modules + esbuild pre-bundling             │
│                                                       │
│  Browser ──HTTP──▶ Vite Dev Server ──▶ Transform      │
│    │                    │                on demand     │
│    │                    │                              │
│    └── <script type="module" src="/src/main.tsx">     │
│         │                                             │
│         ├── import App from './App.tsx'                │
│         │   └── Vite transforms JSX on the fly        │
│         ├── import './index.css'                       │
│         │   └── Vite injects as <style> tag           │
│         └── import { debounce } from 'lodash-es'      │
│             └── Pre-bundled by esbuild (once)         │
│                                                       │
│  Key: No bundling in dev. Each module = 1 HTTP req    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  PRODUCTION                           │
│                                                       │
│  Rollup for full bundle (tree shaking, code split)    │
│                                                       │
│  Source ──▶ Rollup ──▶ Optimized chunks               │
│                ├── Tree shaking                        │
│                ├── Code splitting                      │
│                ├── Minification                        │
│                └── Asset hashing                       │
└──────────────────────────────────────────────────────┘
```

### 3.3 Why Vite is Fast — Native ES Modules

In traditional bundlers (webpack, CRA), the dev server must:
1. Parse the entire project
2. Build the complete dependency graph
3. Bundle everything into memory
4. Serve the bundle
5. **On file change: rebuild affected chunks**

Vite takes a radically different approach:
1. Serve `index.html` which has `<script type="module" src="/src/main.tsx">`
2. Browser parses `main.tsx`, sees `import App from './App.tsx'`, sends HTTP request to Vite server
3. Vite transforms `App.tsx` on-demand (JSX → JS, TypeScript → JS) and serves it
4. Browser continues importing — each import = one HTTP request
5. **On file change: only retransform that one file**

This means:
- **Server start is nearly instant** — Vite doesn't need to process your entire app
- **HMR is nearly instant** — only one file needs retransforming
- **Project size doesn't affect startup time** — modules load on demand

### 3.4 esbuild Pre-Bundling

There is one problem with the native ES modules approach: `node_modules`. A library like `lodash-es` has hundreds of internal ES modules. If the browser had to make hundreds of HTTP requests for a single `import { debounce } from 'lodash-es'`, it would be slow.

Vite solves this with **dependency pre-bundling** using esbuild:

```
First dev start:
  1. Scan source code for bare imports (react, lodash-es, etc.)
  2. Run esbuild to bundle each dependency into a single ES module
  3. Cache in node_modules/.vite/
  4. Serve pre-bundled deps with aggressive HTTP caching headers

Subsequent starts:
  1. Read from cache (near-instant)
  2. Only re-bundle if package.json or lock file changed
```

Why esbuild? It is written in Go and is **10-100x faster** than JavaScript-based bundlers:

| Tool | Bundling 10,000 modules |
|---|---|
| esbuild | ~0.3 seconds |
| webpack 5 | ~30 seconds |
| Rollup | ~25 seconds |
| Parcel 2 | ~15 seconds |

esbuild achieves this speed through Go's parallelism, a from-scratch architecture with minimal AST passes, and zero-cost abstractions.

### 3.5 HMR Architecture

Vite's HMR uses a WebSocket connection between the dev server and the browser:

```
File saved ──▶ Vite detects change (chokidar file watcher)
           ──▶ Determine which module(s) changed
           ──▶ Invalidate module + walk importers to find HMR boundary
           ──▶ Send WebSocket message: { type: 'update', updates: [...] }
           ──▶ Browser fetches new module version (with cache-busting query)
           ──▶ Hot module API applies update (React Fast Refresh for .jsx/.tsx)
           ──▶ Component re-renders with new code, state preserved
```

Key difference from webpack's HMR: Vite only sends the changed module. Webpack must rebuild all affected chunks. As projects grow, webpack's HMR slows down linearly; Vite's stays constant-time.

### 3.6 Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';     // uses Babel
// OR
import react from '@vitejs/plugin-react-swc'; // uses SWC (faster)

export default defineConfig({
  // Plugins
  plugins: [react()],

  // Dev server
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // Build options
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    // Target modern browsers (default: 'modules' = native ES modules support)
    target: 'es2020',
    // CSS code splitting — each async chunk gets its own CSS file
    cssCodeSplit: true,
    // Chunk size warning limit (kB)
    chunkSizeWarningLimit: 500,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // Environment variables: only VITE_* vars are exposed to client code
  // Access via import.meta.env.VITE_API_URL
  // (process.env is NOT available in Vite)

  // CSS
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',  // CSS Modules class naming
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },

  // Base path for deployment (like GitHub Pages)
  base: '/my-app/',
});
```

### 3.7 Vite Plugin System

Vite plugins extend Rollup's plugin interface with Vite-specific hooks:

```ts
// A simple Vite plugin
function myPlugin(): Plugin {
  return {
    name: 'my-plugin',

    // Vite-specific hooks
    configResolved(config) {
      // Access resolved Vite config
    },
    configureServer(server) {
      // Add custom middleware to dev server
      server.middlewares.use((req, res, next) => {
        if (req.url === '/health') {
          res.end('ok');
          return;
        }
        next();
      });
    },
    transformIndexHtml(html) {
      // Modify index.html
      return html.replace('</head>', '<meta name="built-with" content="vite" /></head>');
    },

    // Rollup-compatible hooks (work in both dev and build)
    resolveId(id) {
      // Custom module resolution
      if (id === 'virtual:my-module') return '\0virtual:my-module';
    },
    load(id) {
      // Provide virtual module content
      if (id === '\0virtual:my-module') return 'export default "hello"';
    },
    transform(code, id) {
      // Transform module code
      if (id.endsWith('.custom')) {
        return { code: compileCustomFormat(code), map: null };
      }
    },
  };
}
```

Key official plugins:
- `@vitejs/plugin-react` — React support via Babel (Fast Refresh, JSX)
- `@vitejs/plugin-react-swc` — React support via SWC (faster than Babel)
- `@vitejs/plugin-legacy` — Legacy browser support via `@babel/preset-env` + polyfills
- `vite-plugin-pwa` — Progressive Web App support (service worker, manifest)
- `vite-plugin-svgr` — Import SVGs as React components

### 3.8 Environment Variables in Vite

```bash
# .env                  — loaded in all cases
# .env.local            — loaded in all cases, gitignored
# .env.development      — loaded in dev mode
# .env.production       — loaded in production build

# Only variables prefixed with VITE_ are exposed to client code
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App

# This is NOT exposed (no VITE_ prefix) — server-side only
DATABASE_URL=postgres://localhost/mydb
```

```ts
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
const mode = import.meta.env.MODE;       // 'development' or 'production'
const isDev = import.meta.env.DEV;       // boolean
const isProd = import.meta.env.PROD;     // boolean
const baseUrl = import.meta.env.BASE_URL; // from vite.config.ts `base`

// TypeScript: declare custom env vars
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 4. Webpack vs Vite Comparison

| Feature | Webpack 5 | Vite 6 |
|---|---|---|
| **Dev server architecture** | Bundles everything, serves from memory | Native ES modules, transforms on demand |
| **Dev startup time** | Slow (10-60s for large apps) | Near-instant (<1s) |
| **HMR speed** | Degrades with project size | Constant-time (~50ms) |
| **Production bundler** | Webpack (custom) | Rollup (battle-tested) |
| **Transpiler** | Babel (via babel-loader) | esbuild (dev) + Babel/SWC (via plugin) |
| **Config complexity** | Complex (100-500 line configs typical) | Minimal (20-50 lines typical) |
| **CSS handling** | Requires loaders (css-loader, style-loader, etc.) | Built-in (CSS Modules, PostCSS, Sass with one install) |
| **TypeScript** | Requires ts-loader or babel-loader + @babel/preset-typescript | Built-in (esbuild strips types, no type checking) |
| **Static assets** | Asset modules (type: 'asset') | Built-in, URL imports work out of the box |
| **Environment variables** | `DefinePlugin` with `process.env.*` | `import.meta.env.VITE_*` (no plugin needed) |
| **Code splitting** | Dynamic imports + splitChunks config | Dynamic imports + `build.rollupOptions.output.manualChunks` |
| **Tree shaking** | Yes (requires `sideEffects` config) | Yes (Rollup's tree shaking is considered superior) |
| **SSR** | Requires additional setup | Built-in SSR support |
| **Plugin ecosystem** | Massive (10,000+ npm packages) | Growing (Rollup-compatible + Vite-specific) |
| **Learning curve** | Steep | Gentle |
| **Legacy browser support** | Via babel-loader + polyfills | Via `@vitejs/plugin-legacy` |
| **Maturity** | Battle-tested since 2012 | Production-ready since 2021 |

### When to Use Webpack

- **Existing large codebase** already on webpack — migration cost may not be worth it
- **Highly custom build requirements** — webpack's loader/plugin ecosystem is unmatched
- **Module Federation** — webpack 5's Module Federation for micro-frontends has no Vite equivalent
- **Need fine-grained control** over every aspect of the build

### When to Use Vite

- **New projects** — React, Vue, Svelte, or any modern framework
- **DX is a priority** — instant server start, fast HMR
- **Migrating from CRA** — Vite is the natural successor
- **Library development** — Vite's library mode uses Rollup, which produces clean output

### Migration from CRA to Vite

```bash
# 1. Install Vite + plugin
npm install -D vite @vitejs/plugin-react

# 2. Create vite.config.ts (see section 3.6)

# 3. Move public/index.html to root, add module script
#    <script type="module" src="/src/index.tsx"></script>

# 4. Replace REACT_APP_ env vars with VITE_
#    process.env.REACT_APP_* → import.meta.env.VITE_*

# 5. Update package.json scripts
#    "start" → "vite"
#    "build" → "vite build"

# 6. Remove react-scripts
npm uninstall react-scripts
```

---

## 5. Other Bundlers Overview

### 5.1 Rollup

**What:** A module bundler focused on ES modules and library bundling. Created by Rich Harris (also creator of Svelte). First released 2015.

**Key characteristics:**
- Designed for **library authors** — produces clean, readable output
- Best-in-class **tree shaking** (pioneered it for JavaScript)
- Outputs ESM, CommonJS, UMD, IIFE formats
- Used by Vite as the production bundler
- Simpler plugin API than webpack

```js
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/bundle.cjs.js', format: 'cjs' },    // CommonJS
    { file: 'dist/bundle.esm.js', format: 'es' },      // ES modules
    { file: 'dist/bundle.umd.js', format: 'umd', name: 'MyLib' },
  ],
  plugins: [resolve(), commonjs(), terser()],
  external: ['react', 'react-dom'],  // don't bundle peer deps
};
```

**When to use:** Building npm packages / libraries. Not typically used directly for applications (use Vite instead, which uses Rollup internally).

### 5.2 esbuild

**What:** An extremely fast JavaScript/TypeScript bundler and minifier written in **Go**. Created by Evan Wallace (co-founder of Figma). First released 2020.

**Key characteristics:**
- **10-100x faster** than webpack, Rollup, or Parcel
- Compiles TypeScript and JSX natively (no Babel needed)
- Used by Vite for dependency pre-bundling and dev transforms
- Limited plugin API compared to webpack/Rollup
- Does not perform type checking (only strips types)
- No HMR support (not designed as a dev server)

```bash
# Bundle an app
esbuild src/index.tsx --bundle --outfile=dist/bundle.js --minify --sourcemap

# As an API
```

```js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/bundle.js',
  target: ['es2020'],
  loader: {
    '.png': 'dataurl',
    '.svg': 'text',
  },
});
```

**When to use:** As part of other toolchains (Vite uses it). Also good for build scripts, CLI tools, and simple bundling tasks where speed is paramount and you don't need the full plugin ecosystem.

### 5.3 Parcel

**What:** A **zero-configuration** web application bundler. First released 2017. Current version: Parcel 2.

**Key characteristics:**
- **Zero config** — just point it at your HTML entry point
- Automatic detection of file types (JSX, TypeScript, CSS Modules, etc.)
- Built-in dev server with HMR
- Automatic code splitting via dynamic imports
- Uses SWC for JavaScript transformation (since Parcel 2)
- Scope hoisting (like Rollup's tree shaking)
- Multi-core compilation via worker threads

```bash
# Install
npm install -D parcel

# Dev server — just point at HTML, Parcel figures out everything else
npx parcel src/index.html

# Production build
npx parcel build src/index.html
```

```json
// package.json — that's it. No config file needed.
{
  "source": "src/index.html",
  "scripts": {
    "start": "parcel",
    "build": "parcel build"
  }
}
```

**When to use:** Quick prototypes, small-medium projects where you want zero configuration overhead. Less common in large production React apps.

### 5.4 Turbopack

**What:** Webpack's successor by Vercel, written in **Rust**. Announced October 2022. Created by Tobias Koppers (the original webpack author) working at Vercel.

**Key characteristics:**
- Written in Rust for maximum performance
- Incremental computation engine — only recomputes what changed
- Function-level caching (more granular than file-level)
- Used as the dev server in **Next.js 13+** (`next dev --turbo`)
- Claims up to **700x faster** than webpack for large apps (hot updates)
- As of 2024, **dev mode only** — production builds still use webpack in Next.js
- Not yet available as a standalone bundler

```bash
# Use Turbopack in Next.js
npx next dev --turbo
```

**When to use:** If you are using Next.js, Turbopack is the default dev bundler as of Next.js 14. Not yet usable outside of Next.js.

### 5.5 SWC (Speedy Web Compiler)

**What:** Not a bundler — it is a **Rust-based JavaScript/TypeScript compiler**. A drop-in replacement for Babel. Created by Donny (kdy1). First released 2019.

**Key characteristics:**
- **20x faster** than Babel for transpilation
- Handles JSX transformation, TypeScript stripping, minification
- Used by Next.js (replaces Babel since Next.js 12), Parcel 2, and Vite (via `@vitejs/plugin-react-swc`)
- Plugin system via Rust (WebAssembly plugins also supported)
- Drop-in `.swcrc` config similar to `.babelrc`

```json
// .swcrc
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true
    },
    "transform": {
      "react": {
        "runtime": "automatic"    // React 17+ JSX transform
      }
    },
    "target": "es2020"
  },
  "minify": true
}
```

**When to use:** Anywhere you currently use Babel. SWC is faster and produces equivalent output. Adopted by Next.js, Parcel, and available as a Vite plugin.

### 5.6 Bundler Comparison Summary

| Feature | Webpack | Vite | Rollup | esbuild | Parcel | Turbopack |
|---|---|---|---|---|---|---|
| **Language** | JS | JS | JS | Go | JS + SWC (Rust) | Rust |
| **Primary use** | Applications | Applications | Libraries | Build tool component | Applications | Next.js dev |
| **Config** | Complex | Minimal | Moderate | Minimal | Zero | N/A (Next.js) |
| **Dev speed** | Slow | Fast | N/A | N/A | Medium | Fastest |
| **Tree shaking** | Good | Great (Rollup) | Best | Good | Good | N/A |
| **Plugin ecosystem** | Massive | Growing | Large | Limited | Medium | N/A |
| **Code splitting** | Yes | Yes | Yes (manual) | Yes (basic) | Yes (auto) | Yes |
| **HMR** | Yes | Yes | No | No | Yes | Yes |
| **Maturity** | Proven (2012) | Proven (2020) | Proven (2015) | Proven (2020) | Mature (2017) | Early (2022) |

---

## 6. Package Managers — npm vs yarn vs pnpm

### 6.1 What is a Package Manager?

A package manager automates the process of installing, updating, configuring, and removing third-party packages (dependencies) in a project. For JavaScript, the primary registry is **npmjs.com** (over 2 million packages).

A package manager handles:
- **Dependency resolution** — given a list of direct dependencies, determine all transitive dependencies and their compatible versions
- **Installation** — download packages from the registry and place them on disk
- **Lock files** — record the exact versions installed to ensure reproducible builds
- **Scripts** — run project-defined commands (`npm run build`, etc.)
- **Publishing** — upload your own packages to the registry

### 6.2 npm (Node Package Manager)

**npm** ships with Node.js and is the default package manager. Current version: npm 10 (ships with Node.js 20+).

#### How npm Resolution Works

```
package.json declares:
  "react": "^18.2.0"          ← compatible range
  "lodash": "4.17.21"         ← exact version

npm install:
  1. Read package.json
  2. Fetch metadata from registry (versions, dependencies)
  3. Build dependency tree, resolve version conflicts
  4. Download tarballs
  5. Extract into node_modules/ (hoisted flat structure since npm 3)
  6. Write package-lock.json (exact resolved versions)
```

#### node_modules Structure (Hoisting)

```
# npm 3+ uses a flat (hoisted) structure
node_modules/
├── react/              ← hoisted to root
├── react-dom/          ← hoisted to root
├── scheduler/          ← hoisted (dep of react-dom)
├── lodash/
└── my-package/
    └── node_modules/
        └── lodash/     ← duplicate! Different version than root lodash
```

Hoisting means npm tries to install all packages at the top level of `node_modules/`. If two packages need different versions of the same dependency, one gets nested. This leads to:
- **Phantom dependencies** — you can import packages you didn't declare in `package.json` (because they are hoisted from a transitive dependency)
- **Dependency doppelgangers** — multiple copies of the same package at different versions

#### Key npm Commands

```bash
npm install               # install all deps from package.json
npm install react         # add dependency (saves to package.json)
npm install -D jest       # add dev dependency
npm install -g typescript # install globally
npm uninstall lodash      # remove dependency
npm update                # update to latest within semver range
npm outdated              # list outdated packages
npm audit                 # check for known vulnerabilities
npm audit fix             # auto-fix vulnerabilities
npm ls                    # print dependency tree
npm ls react              # find which versions of react are installed
npm cache clean --force   # clear npm cache
npm run build             # run script from package.json
npm ci                    # clean install (delete node_modules, install from lock file)
npm pack                  # create a tarball of the package
npm publish               # publish to npm registry
npm version patch         # bump version (patch/minor/major)
```

#### package-lock.json

The lock file records the exact version, resolved URL, and integrity hash (SHA-512) of every installed package. This ensures that `npm ci` produces the same `node_modules/` tree on every machine.

```json
{
  "name": "my-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/react": {
      "version": "18.2.0",
      "resolved": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
      "integrity": "sha512-/3IjMdb2L9QbBdWiW5e3P2/npwMBaU9mHCSCUzNln0ZCYbcfTsGbTJrU/kGemdH2IWmB2ioZ+zkxtmq6g09fGQ==",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    }
  }
}
```

**Important:** Always commit `package-lock.json` to version control. Use `npm ci` (not `npm install`) in CI/CD pipelines — it is faster and ensures reproducible builds.

#### npm vs npm ci

| `npm install` | `npm ci` |
|---|---|
| Reads `package.json` | Reads `package-lock.json` |
| May update lock file | Never modifies lock file |
| Can install ranges | Installs exact versions |
| Keeps existing `node_modules/` | Deletes `node_modules/` first |
| Slower | Faster |
| Use in development | Use in CI/CD |

### 6.3 Yarn

**Yarn** was created by Facebook in 2016 to address npm's problems at the time (no lock file, slow installs, non-deterministic). Current versions: Yarn Classic (1.x) and Yarn Berry (2.x, 3.x, 4.x).

#### Yarn Classic (1.x)

Yarn Classic introduced:
- `yarn.lock` — deterministic lock file (npm didn't have `package-lock.json` until npm 5)
- Parallel downloads — significantly faster than npm at the time
- Offline cache — packages cached in `~/.yarn/cache`, install works offline
- Workspaces — first-class monorepo support

```bash
yarn install            # install all deps
yarn add react          # add dependency
yarn add -D jest        # add dev dependency
yarn remove lodash      # remove dependency
yarn upgrade            # update all deps
yarn why lodash         # why is this package installed?
yarn workspace <name> add react  # add dep to a workspace
```

#### Yarn Berry (2+) with Plug'n'Play (PnP)

Yarn Berry (2020+) introduced **Plug'n'Play (PnP)**, which eliminates `node_modules/` entirely:

```
Traditional (node_modules):
  npm install → download → extract → write 50,000+ files to node_modules/
  Node resolves: require('react') → search node_modules/ directories up the tree

Yarn PnP:
  yarn install → download → store as .zip in .yarn/cache/
  Generate .pnp.cjs → maps package names to exact .zip file locations
  Node resolves: require('react') → .pnp.cjs says "it's in .yarn/cache/react-npm-18.2.0-abc123.zip"
```

Benefits of PnP:
- **Much faster installs** — no extracting thousands of files
- **Saves disk space** — `.zip` files are smaller than extracted `node_modules/`
- **No phantom dependencies** — strict dependency resolution, you can only import what you declare
- **Zero-installs** — commit `.yarn/cache/` to git, no install step needed in CI

Downsides of PnP:
- **Compatibility issues** — some packages assume `node_modules/` exists
- **IDE support** — requires editor SDKs (VSCode extension, etc.)
- **Learning curve** — significantly different from traditional workflow

#### Yarn Workspaces (Monorepo)

```json
// root package.json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}

// File structure:
// packages/
//   shared-utils/package.json
//   ui-components/package.json
// apps/
//   web/package.json
//   mobile/package.json
```

```bash
# Run build in all workspaces
yarn workspaces foreach run build

# Add dependency to a specific workspace
yarn workspace web add react-router-dom
```

### 6.4 pnpm

**pnpm** (performant npm) was created by Zoltan Kochan in 2017. It takes a radically different approach to package storage. Current version: pnpm 9 (2024).

#### Content-Addressable Store

pnpm stores all packages in a global **content-addressable store** (default: `~/.local/share/pnpm/store/`). Every version of every package is stored only once on disk, no matter how many projects use it.

```
~/.local/share/pnpm/store/v3/
  files/
    00/0a1b2c3d4e5f...    ← content-addressable (file hash = name)
    01/6a7b8c9d0e1f...
    ...

project/node_modules/
  .pnpm/
    react@18.2.0/
      node_modules/
        react/              ← hard link to store (NOT a copy)
          index.js          ← actual file data lives in the store
  react -> .pnpm/react@18.2.0/node_modules/react   ← symlink
```

The workflow:
1. Package files are saved once in the global store (content-addressable by file hash)
2. **Hard links** point from `node_modules/.pnpm/` to the store (same inode, zero additional disk space)
3. **Symlinks** at the top of `node_modules/` point to the correct version inside `.pnpm/`

Benefits:
- **Massive disk savings** — if 10 projects use React 18.2.0, the files exist only once on disk
- **Blazing fast installs** — hard linking is nearly instant (no file copying)
- **Strict by default** — no hoisting, no phantom dependencies. You can only `import` what is in your `package.json`

#### pnpm's Non-Flat node_modules

```
node_modules/
├── .pnpm/                          ← virtual store (hard links to global store)
│   ├── react@18.2.0/
│   │   └── node_modules/
│   │       ├── react/              ← hard link to store
│   │       └── loose-envify/       ← hard link (react's dependency)
│   └── react-dom@18.2.0/
│       └── node_modules/
│           ├── react-dom/          ← hard link to store
│           ├── react/              ← symlink to .pnpm/react@18.2.0/...
│           └── scheduler/          ← hard link
├── react -> .pnpm/react@18.2.0/node_modules/react           ← symlink
└── react-dom -> .pnpm/react-dom@18.2.0/node_modules/react-dom   ← symlink
```

Your code can only access `react` and `react-dom` (the symlinks at the top). You cannot accidentally import `scheduler` (which is a transitive dependency of `react-dom`) because it is not symlinked at the top level.

#### Key pnpm Commands

```bash
pnpm install              # install all deps
pnpm add react            # add dependency
pnpm add -D jest          # add dev dependency
pnpm remove lodash        # remove dependency
pnpm update               # update deps
pnpm why lodash           # why is this installed?
pnpm store prune          # remove unreferenced packages from global store
pnpm -r run build         # run script in all workspace packages
```

#### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```bash
# Install deps for all workspaces
pnpm install

# Add dep to specific workspace
pnpm add react --filter web

# Run build in all workspaces
pnpm -r run build

# Run build only in packages that changed since main
pnpm -r --filter '...[origin/main]' run build
```

### 6.5 Comparison Table

| Feature | npm 10 | Yarn Classic 1.x | Yarn Berry 4.x | pnpm 9 |
|---|---|---|---|---|
| **Ships with Node.js** | Yes | No | No | No |
| **Lock file** | `package-lock.json` | `yarn.lock` | `yarn.lock` | `pnpm-lock.yaml` |
| **Install speed** | Medium | Fast | Fastest (PnP) | Fast |
| **Disk usage** | High (copies) | High (copies) | Low (.zip cache) | Lowest (hard links) |
| **node_modules** | Flat (hoisted) | Flat (hoisted) | None (PnP) or `node_modules` | Non-flat (symlinked) |
| **Phantom deps** | Yes (hoisted) | Yes (hoisted) | No (PnP) | No (strict) |
| **Monorepo support** | Workspaces (npm 7+) | Workspaces | Workspaces | Workspaces (best) |
| **Offline install** | With cache | With cache | Zero-installs | With store |
| **Security audit** | `npm audit` | `yarn audit` | `yarn npm audit` | `pnpm audit` |
| **Plug'n'Play** | No | No | Yes (default) | No |
| **Config** | `.npmrc` | `.yarnrc` | `.yarnrc.yml` | `.npmrc` |
| **CLI** | `npm` | `yarn` | `yarn` | `pnpm` |
| **npx equivalent** | `npx` | N/A (yarn 1) | `yarn dlx` | `pnpm dlx` |

### 6.6 Speed Comparison (Approximate)

For a medium React project (~200 dependencies):

| Scenario | npm | Yarn Classic | Yarn PnP | pnpm |
|---|---|---|---|---|
| **Cold install** (no cache) | ~35s | ~25s | ~20s | ~15s |
| **Warm install** (with cache) | ~15s | ~10s | ~3s | ~5s |
| **Install with lock file** (`ci`) | ~20s | ~12s | ~2s | ~8s |
| **Add one package** | ~8s | ~5s | ~2s | ~3s |

These vary by project size, network speed, and hardware. The key takeaways:
- pnpm and Yarn PnP are fastest for cold installs
- Yarn PnP with zero-installs is fastest overall (no install step at all)
- npm is the slowest but has improved significantly since npm 7

### 6.7 When to Use Which

**npm** — Default choice. Zero setup. Best compatibility. Use when you don't have a specific reason for alternatives. Required for publishing to npm registry.

**Yarn Classic** — Legacy choice. Many existing projects use it. Workspaces work well. If starting new, consider Yarn Berry or pnpm instead.

**Yarn Berry (PnP)** — Best for teams comfortable with the PnP paradigm. Zero-installs in CI is a killer feature. Good for monorepos. Compatibility issues can be frustrating.

**pnpm** — Best for monorepos. Best disk usage. Strictest dependency resolution (catches phantom deps). Fast. Growing rapidly in popularity. Used by Vue, Vite, and many large open-source projects.

---

## 7. npx

### 7.1 What is npx?

`npx` (Node Package Execute) ships with npm 5.2+ (2017). It executes npm package binaries without requiring a global install.

### 7.2 How npx Works

```bash
npx create-react-app my-app
```

What happens:
1. Check if `create-react-app` exists in local `node_modules/.bin/`
2. If not, check if it exists globally
3. If not, **download it temporarily**, execute it, then delete it

This means you always run the **latest version** without polluting your global installs.

### 7.3 Common Use Cases

```bash
# Scaffold new projects (most common use case)
npx create-react-app my-app            # CRA (legacy)
npx create-vite@latest my-app          # Vite
npx create-next-app@latest my-app      # Next.js
npx create-remix my-app                # Remix

# Run local project binaries
npx eslint src/                         # runs ./node_modules/.bin/eslint
npx jest --watchAll                     # runs local jest
npx tsc --noEmit                        # TypeScript type checking

# One-off tools (not installed in project)
npx serve dist/                         # static file server
npx http-server                         # another static server
npx json-server db.json                 # mock REST API
npx kill-port 3000                      # kill process on port
npx sort-package-json                   # sort package.json keys
npx npm-check-updates -u               # update all deps to latest

# Run a specific version
npx create-vite@5.0.0 my-app

# Run from a GitHub repo
npx github:user/repo

# Specify the package name explicitly (when bin name differs)
npx -p @angular/cli ng new my-app
npx -p typescript tsc --init
```

### 7.4 npx vs npm exec vs yarn dlx vs pnpm dlx

| Command | Tool | Purpose |
|---|---|---|
| `npx <cmd>` | npm | Execute package binary |
| `npm exec <cmd>` | npm | Same as npx (explicit form) |
| `yarn dlx <cmd>` | Yarn Berry | Download and execute (like npx) |
| `pnpm dlx <cmd>` | pnpm | Download and execute (like npx) |

---

## 8. package.json Deep Dive

### 8.1 Essential Fields

```json
{
  "name": "my-react-app",
  "version": "1.2.3",
  "description": "A React application for interview prep",
  "private": true,
  "license": "MIT",
  "author": "Jane Doe <jane@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/jane/my-app.git"
  },
  "keywords": ["react", "interview", "typescript"]
}
```

- **`private: true`** — prevents accidental `npm publish`. Always set for applications (not libraries).
- **`name`** — must be lowercase, no spaces. Scoped packages: `@myorg/my-package`.
- **`version`** — semver (see below). Required for publishing.

### 8.2 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0",
    "@types/react": "^18.2.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": false
    }
  },
  "optionalDependencies": {
    "fsevents": "^2.3.0"
  }
}
```

| Field | Installed When | Purpose | Example |
|---|---|---|---|
| `dependencies` | `npm install` (always) | Required at runtime | react, express, lodash |
| `devDependencies` | `npm install` (not in production with `--omit=dev`) | Only needed for development/build | vite, eslint, jest, @types/* |
| `peerDependencies` | **Not auto-installed** (npm 7+ auto-installs) | "I need this, but the consumer should provide it" | react (for a React component library) |
| `optionalDependencies` | `npm install` (failure is ok) | Platform-specific, non-critical | fsevents (macOS only) |

**When to use peerDependencies:**

```
You're building a React component library (my-ui-lib).
Your library uses React, but you don't want to bundle your own copy.
The consuming app already has React installed.

If React were in dependencies:
  app/node_modules/react        ← app's React (18.2.0)
  app/node_modules/my-ui-lib/
    node_modules/react           ← SEPARATE copy of React (18.2.0)
  → Two React instances = hooks break, context breaks

If React is in peerDependencies:
  app/node_modules/react        ← single React instance
  app/node_modules/my-ui-lib/   ← uses the app's React
  → One React instance = everything works
```

### 8.3 Semantic Versioning (SemVer)

Version format: `MAJOR.MINOR.PATCH` (e.g., `18.2.1`)

| Version Part | When Incremented | Example |
|---|---|---|
| **MAJOR** | Breaking changes (incompatible API) | 17.0.0 → 18.0.0 |
| **MINOR** | New features (backward-compatible) | 18.1.0 → 18.2.0 |
| **PATCH** | Bug fixes (backward-compatible) | 18.2.0 → 18.2.1 |

**Version ranges in package.json:**

| Syntax | Meaning | Example | Matches |
|---|---|---|---|
| `"18.2.1"` | Exact version | `"react": "18.2.1"` | Only 18.2.1 |
| `"^18.2.1"` | Compatible with (same MAJOR) | `"react": "^18.2.1"` | >=18.2.1, <19.0.0 |
| `"~18.2.1"` | Approximately (same MAJOR.MINOR) | `"react": "~18.2.1"` | >=18.2.1, <18.3.0 |
| `">=18.0.0"` | Greater than or equal | `"react": ">=18.0.0"` | 18.0.0, 18.1.0, 19.0.0, ... |
| `"18.2.x"` | Any patch version | `"react": "18.2.x"` | 18.2.0, 18.2.1, 18.2.2, ... |
| `"*"` | Any version | `"react": "*"` | Anything |
| `"18.2.0 - 18.3.0"` | Inclusive range | — | >=18.2.0, <=18.3.0 |

**The caret (`^`) is the default** when you `npm install react`. It allows minor and patch updates but not major. This is usually what you want — minor/patch updates should be backward-compatible.

**The tilde (`~`)** is more restrictive — only allows patch updates. Use when a library has a history of breaking changes in minor versions.

### 8.4 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "format": "prettier --write src/",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "typecheck": "tsc --noEmit",
    "prepare": "husky install",
    "precommit": "lint-staged",
    "clean": "rm -rf dist node_modules",
    "analyze": "vite-bundle-visualizer"
  }
}
```

**Lifecycle scripts** — npm runs these automatically:

| Script | When |
|---|---|
| `preinstall` | Before `npm install` |
| `postinstall` | After `npm install` |
| `prepare` | After install + before publish (good for husky) |
| `prepublishOnly` | Before `npm publish` only |
| `pretest` | Before `npm test` |
| `posttest` | After `npm test` |
| `pre<script>` | Before any custom script |
| `post<script>` | After any custom script |

```bash
# Run scripts
npm run dev                  # run "dev" script
npm test                     # shorthand for npm run test
npm start                    # shorthand for npm run start
npm run build -- --mode staging  # pass args to the script
```

### 8.5 Entry Points — main, module, exports

These fields tell bundlers and Node.js how to resolve `import`/`require` of your package:

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false
}
```

| Field | Purpose | Used By |
|---|---|---|
| `main` | CJS entry point (`require()`) | Node.js, webpack, older tools |
| `module` | ESM entry point (`import`) | webpack, Rollup, Vite (unofficial field) |
| `types` | TypeScript declaration entry | TypeScript compiler |
| `exports` | Modern entry point map (replaces main/module) | Node.js 12.7+, modern bundlers |
| `type` | `"module"` = `.js` files are ESM; `"commonjs"` (default) = `.js` files are CJS | Node.js |
| `files` | Whitelist of files to include in npm package | npm publish |
| `sideEffects` | `false` = all files are safe to tree-shake | webpack, Rollup, Vite |

**The `exports` field is the modern standard.** It supports conditional exports (different entry points for import vs require), subpath exports, and prevents consumers from importing internal files.

```js
// Consumer code
import { MyComponent } from 'my-lib';        // resolves via "." export
import { helpers } from 'my-lib/utils';       // resolves via "./utils" export
import { internal } from 'my-lib/src/core';   // ERROR — not in exports map
```

### 8.6 Other Important Fields

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ],
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  },
  "packageManager": "pnpm@9.0.0"
}
```

- **`engines`** — declares required Node.js/npm versions. Enforced with `engine-strict=true` in `.npmrc`.
- **`browserslist`** — target browsers for Babel, PostCSS autoprefixer, etc.
- **`packageManager`** — used by Corepack to auto-install the correct package manager version.
- **`lint-staged`** — config for `lint-staged` (runs linters on staged git files).

---

## 9. Interview Questions & Answers

### Beginner

**Q1: What is a bundler and why do React apps need one?**

A bundler is a tool that takes your source files (JS, JSX, CSS, images, etc.) and combines them into optimized output files for the browser. React apps need a bundler because: (1) browsers cannot parse JSX — it must be transpiled to JavaScript via Babel/SWC/esbuild, (2) bare module specifiers like `import React from 'react'` don't work in browsers, (3) without bundling, loading hundreds of individual module files via HTTP would be catastrophically slow, (4) production apps need tree shaking, code splitting, minification, and asset processing that only a bundler can provide.

---

**Q2: What is the difference between dependencies and devDependencies?**

`dependencies` are packages required at runtime in production — React, React Router, Axios, etc. They are always installed. `devDependencies` are packages needed only during development or build — Vite, TypeScript, ESLint, Jest, `@types/*` packages. In production deployments, `npm install --omit=dev` skips devDependencies. For frontend apps built into static files, this distinction matters less (everything is used at build time), but it is critical for npm packages and Node.js servers. The convention is: if the user's browser needs it at runtime, it is a dependency; if only the developer's machine needs it, it is a devDependency.

---

**Q3: What does the `^` (caret) mean in `"react": "^18.2.0"`?**

The caret means "compatible with" — it allows updates that do not change the leftmost non-zero digit. For `^18.2.0`, it matches any version `>=18.2.0` and `<19.0.0`. This allows minor and patch updates (18.2.1, 18.3.0) but blocks major updates (19.0.0). The caret is the default range operator when you run `npm install react`. It relies on the semver convention that major versions contain breaking changes, while minor and patch versions are backward-compatible.

---

**Q4: What is npx and how is it different from npm?**

`npm` is a package manager — it installs and manages dependencies. `npx` is a package runner — it executes binaries from npm packages. The key difference: `npx create-vite my-app` downloads `create-vite` temporarily, runs it, and deletes it. Without npx, you'd need `npm install -g create-vite` then `create-vite my-app`, polluting your global installs. npx also runs local project binaries: `npx eslint .` finds and runs `./node_modules/.bin/eslint` without needing a script in package.json.

---

**Q5: What is the purpose of a lock file (package-lock.json)?**

A lock file records the exact version, download URL, and integrity hash of every installed package (including transitive dependencies). Without it, `npm install` resolves version ranges at install time, which can produce different results on different machines or at different times (if a new version was published). The lock file ensures **reproducible builds** — every developer and CI machine gets identical `node_modules/`. You should always commit the lock file. In CI, use `npm ci` (which reads only from the lock file) instead of `npm install`.

---

### Intermediate

**Q6: How does webpack's dependency graph work?**

Webpack starts at the configured entry point (e.g., `./src/index.js`) and recursively parses every `import` and `require()` statement to build a directed acyclic graph (DAG) of all modules in the application. For each file, webpack: (1) resolves the import path using `resolve.extensions` and `resolve.alias`, (2) applies matching loaders to transform the file (e.g., `babel-loader` transpiles JSX), (3) parses the transformed output for further imports, (4) repeats recursively. The resulting graph contains every module, its dependencies, and its transformed code. Webpack then groups modules into chunks (based on entry points and dynamic `import()` calls) and writes the output bundles. This graph-based approach enables tree shaking (remove unused exports) and code splitting (separate chunks loaded on demand).

---

**Q7: Explain how Vite's dev server works and why it's faster than webpack's.**

Vite's dev server leverages native ES modules in the browser. Instead of bundling the entire app before serving (like webpack), Vite: (1) serves `index.html` with a `<script type="module">` tag, (2) the browser parses each file and sends HTTP requests for imports, (3) Vite transforms files on-demand (JSX to JS, TypeScript stripping via esbuild), (4) only the requested module is processed. For `node_modules`, Vite pre-bundles them with esbuild (which is 10-100x faster than webpack) into single files, cached in `node_modules/.vite/`. The result: server starts in milliseconds regardless of project size, because Vite only processes files the browser actually requests. HMR is also faster because only the changed module needs re-transformation, not an entire chunk rebuild.

---

**Q8: What is tree shaking and what are the requirements for it to work?**

Tree shaking is dead code elimination based on ES module static analysis. The bundler examines `import` and `export` statements at build time, determines which exports are never imported anywhere, and removes the unused code. Requirements: (1) the code must use ES modules (`import`/`export`), not CommonJS (`require`/`module.exports`), because ES module imports are statically analyzable while CommonJS imports are dynamic, (2) the bundler must be in production mode (webpack) or configured for optimization, (3) the `sideEffects` field in `package.json` should be set to `false` (or list only files with side effects like CSS) so the bundler knows it's safe to skip entire unused modules. Common pitfall: importing an entire library (`import _ from 'lodash'`) defeats tree shaking. Use named imports from ES module builds (`import { debounce } from 'lodash-es'`).

---

**Q9: How does pnpm's content-addressable store differ from npm's node_modules?**

npm copies package files into each project's `node_modules/` directory. If ten projects use React 18.2.0, there are ten copies on disk. pnpm stores every package file once in a global content-addressable store (keyed by file content hash). In each project, `node_modules/.pnpm/` contains hard links (not copies) pointing to the store. Hard links share the same disk blocks, so there is zero additional disk usage. pnpm also uses a non-flat `node_modules/` structure with symlinks, which prevents phantom dependencies — you can only import packages declared in your `package.json`. This is stricter than npm's hoisted flat structure, where you can accidentally import transitive dependencies.

---

**Q10: What are peerDependencies and when should you use them?**

`peerDependencies` declare that your package requires a dependency to be provided by the consuming application, rather than bundling its own copy. The canonical use case is React component libraries: if your UI library lists React in `dependencies`, the consuming app may end up with two copies of React (its own and the library's), which breaks hooks, context, and reconciliation. By listing React in `peerDependencies`, you're telling npm: "I need React, but the app will provide it — don't install a separate copy." npm 7+ auto-installs peer dependencies and warns on conflicts. Use `peerDependencies` for framework dependencies (react, vue, angular), plugin host packages (eslint for eslint plugins), or any dependency where multiple instances cause problems.

---

### Advanced

**Q11: Explain webpack's code splitting strategies and how splitChunks works.**

Webpack offers three code splitting strategies: (1) **Multiple entry points** — separate bundles for different pages (`entry: { home: './home.js', admin: './admin.js' }`), (2) **Dynamic imports** — `import('./Module')` creates a separate chunk loaded on demand (used with `React.lazy()`), (3) **SplitChunks optimization** — automatically extracts shared modules. The `splitChunks` plugin uses `cacheGroups` to define splitting rules. Each cache group has a `test` regex (which modules to include), `chunks` ('all', 'async', 'initial'), `minSize` (minimum chunk size to split), `minChunks` (minimum number of chunks that must share the module), and `priority` (when a module matches multiple groups). A common pattern: `vendor` group for `node_modules` (long cache lifetime since they change rarely), `react` group for React/ReactDOM (very stable), and `common` group for shared application code. The `runtimeChunk: 'single'` option extracts webpack's runtime code into a separate chunk so that content hashes of other chunks don't change when only the runtime changes.

---

**Q12: How does Vite handle the production build differently from development?**

In development, Vite uses native ES modules with on-demand transformation (no bundling). In production, Vite uses Rollup as a full bundler. The reasons: (1) native ES modules in production would cause a waterfall of HTTP requests — the browser discovers imports sequentially, each requiring a round trip, (2) production needs tree shaking, which requires analyzing the entire module graph, (3) code splitting for optimal chunk loading requires global knowledge of the dependency graph, (4) minification, asset hashing, and CSS extraction need a full build pass. Vite configures Rollup with sensible defaults: automatic code splitting at dynamic import boundaries, CSS code splitting (each async chunk gets its own CSS), asset URL handling with content hashing, and minification via esbuild (faster than Terser). The `build.rollupOptions` field exposes Rollup's full configuration for advanced customization like `manualChunks`.

---

**Q13: What is Yarn PnP and what problems does it solve?**

Yarn Plug'n'Play eliminates the `node_modules/` directory entirely. Instead, Yarn stores packages as `.zip` files in `.yarn/cache/` and generates a `.pnp.cjs` file that maps every package name and version to its location on disk. When Node.js tries to resolve a module, the PnP runtime intercepts the resolution and serves the file directly from the zip archive. Problems solved: (1) **No phantom dependencies** — PnP only resolves packages explicitly declared in your `package.json`, catching undeclared dependency usage immediately, (2) **Faster installs** — writing thousands of files to `node_modules/` is slow; PnP just downloads zip files, (3) **Less disk space** — zip files are smaller than extracted directories, (4) **Deterministic resolution** — no hoisting heuristics that can vary, (5) **Zero-installs** — commit `.yarn/cache/` to git and CI needs no install step at all. Downsides include compatibility issues with packages that use `__dirname` to traverse `node_modules/`, and IDE integration requires editor SDKs.

---

**Q14: Compare the production output of webpack vs Rollup (used by Vite). Which produces better tree-shaking results?**

Rollup generally produces better tree-shaking results because it was designed from the ground up for ES modules. Rollup uses "scope hoisting" — it places all modules in a single scope, which allows the minifier to see and eliminate more dead code. Webpack wraps each module in a function closure (`__webpack_require__`), which creates scope boundaries that can prevent some dead code elimination. Webpack 5 added "concatenateModules" optimization (ModuleConcatenationPlugin) to achieve similar scope hoisting for ES modules, closing the gap significantly. In practice, the difference matters most for library authors where every byte counts. For applications, both produce well-optimized output. Rollup's output is also more readable (useful for libraries consumers might debug), while webpack's output includes more runtime overhead for module loading. Vite uses Rollup for production and esbuild for minification, combining Rollup's superior tree shaking with esbuild's superior minification speed.

---

**Q15: You run `npm install` on a fresh machine and get different packages than your coworker. What went wrong and how do you prevent it?**

Several possible causes: (1) **No lock file committed** — `package.json` uses semver ranges like `^18.2.0`. If a new version (18.3.0) was published between your coworker's install and yours, you get different versions. Fix: always commit `package-lock.json`. (2) **Used `npm install` instead of `npm ci` in CI** — `npm install` can modify the lock file. `npm ci` reads the lock file strictly and fails if it doesn't match `package.json`. (3) **Different npm versions** — different npm versions may resolve dependencies differently. Fix: use `engines` field and `corepack enable` with `packageManager` field. (4) **Lock file was not updated after a change** — someone edited `package.json` but didn't run `npm install` to update the lock file. (5) **Registry inconsistency** — rare, but unpublished packages or different registries can cause divergence. Prevention: commit lock files, use `npm ci` in CI, pin npm version, use `.npmrc` for registry config.

---

**Q16: Explain the role of SWC and esbuild in the modern frontend toolchain. Are they bundlers?**

Neither SWC nor esbuild is primarily a bundler in the way webpack is. **SWC** (Speedy Web Compiler) is a Rust-based compiler and transpiler — a drop-in replacement for Babel. It handles JSX transformation, TypeScript stripping, syntax downleveling, and minification, but 20x faster than Babel. It is used by Next.js (since v12), Parcel 2, and Vite (via `@vitejs/plugin-react-swc`). **esbuild** is a Go-based bundler AND transpiler. It can bundle, but its primary role in the ecosystem is as a fast transpiler and minifier. Vite uses esbuild for: (1) dependency pre-bundling in development, (2) TypeScript/JSX transformation during dev, and (3) minification in production builds. Neither replaces webpack/Vite/Rollup for production application bundling in most real-world cases because they have limited plugin APIs and lack some features (esbuild's code splitting is less sophisticated, SWC is a compiler not a bundler). They are building blocks that other tools compose. The trend is Rust/Go tools handling the compute-intensive transpilation/minification while JavaScript tools handle the orchestration and plugin ecosystem.

---

**Q17: What is Module Federation in webpack 5 and why doesn't Vite have an equivalent?**

Module Federation is a webpack 5 feature that allows independently built and deployed applications to share modules at runtime. Application A can expose a React component, and Application B can consume it without having it at build time — the module is loaded over the network at runtime. This enables **micro-frontends**: separate teams build and deploy their features independently, and a shell application composes them. Key concepts: `exposes` (modules this build makes available), `remotes` (other builds to consume modules from), and `shared` (dependencies that should be deduplicated at runtime, e.g., React). Vite doesn't have a built-in equivalent because Module Federation requires a custom runtime module loading system that is deeply integrated into webpack's module format. There are community plugins (`vite-plugin-federation`) that provide partial compatibility, but they don't match webpack's implementation. This is one of the few remaining reasons large organizations choose webpack over Vite.

---

**Q18: How do you analyze and optimize a webpack/Vite production bundle?**

For webpack: use `webpack-bundle-analyzer` (generates an interactive treemap of chunk contents) or `source-map-explorer` (analyzes source maps). For Vite: use `rollup-plugin-visualizer` or `vite-bundle-visualizer`. Key optimization steps: (1) **Identify large dependencies** — look for libraries that are disproportionately large (moment.js → day.js, lodash → lodash-es with tree shaking), (2) **Code split aggressively** — `React.lazy()` for route-level splitting, dynamic `import()` for heavy features, (3) **Configure manualChunks** — separate vendor code (long cache) from app code (frequent changes), (4) **Enable tree shaking** — use ES module imports, set `sideEffects: false`, avoid barrel files that re-export everything, (5) **Check for duplicates** — multiple versions of the same package (inspect lock file), (6) **Lazy-load heavy libraries** — Mermaid, Babel, chart libraries loaded on demand, (7) **Use `import()` for conditional features** — admin panels, analytics scripts.

---

**Q19: Explain the difference between `npm install`, `npm ci`, and `npm install --production`.**

`npm install` reads `package.json`, resolves the version ranges for all dependencies, downloads and installs them into `node_modules/`, and updates `package-lock.json` if needed. It's flexible — it can add new packages and update the lock file. `npm ci` (clean install) deletes `node_modules/` entirely, reads only from `package-lock.json` (ignoring `package.json` ranges), installs the exact versions recorded, and fails if the lock file is out of sync with `package.json`. It is faster and deterministic — ideal for CI/CD. `npm install --omit=dev` (formerly `--production`) skips `devDependencies`, installing only `dependencies`. Used for production Node.js servers where you don't need build tools. For frontend apps, `devDependencies` are needed at build time, so you typically run `npm ci` (all deps) then `npm run build` in CI.

---

**Q20: A junior developer asks whether to use webpack or Vite for a new React project in 2024. What do you recommend and why?**

Vite, without hesitation. Here is the reasoning: (1) **Official recommendation** — the React docs (react.dev) no longer recommend Create React App and list Vite-based setups as the default, (2) **Developer experience** — Vite's dev server starts in under a second regardless of project size, HMR is near-instant, and the config file is 10-20 lines instead of 100+, (3) **Build quality** — Vite uses Rollup for production, which produces excellent tree-shaking and code splitting output, (4) **Ecosystem** — Vite is used by Vue, Svelte, Solid, Astro, and increasingly React projects. Plugin availability is excellent, (5) **TypeScript** — built-in with zero config, (6) **Migration path** — if you later need something Vite can't do, you can always eject to custom Rollup config or add webpack for specific needs. The only exceptions: if you need webpack Module Federation for micro-frontends, if you're joining a team with an existing webpack setup, or if you need very specific webpack loaders with no Vite equivalent.

**Q21: How can you see the original React source code in browser DevTools even though webpack bundles everything into a single (or few) output file(s)?**

This is possible because of **source maps**. When webpack builds your code, it can generate a `.map` file alongside each bundle (e.g., `main.js.map`). A source map is a JSON file that contains a mapping between every position in the bundled output and the corresponding position in the original source files. The browser DevTools detect the `//# sourceMappingURL=main.js.map` comment at the end of the bundle, fetch the map file, and use it to reconstruct the original file tree under the **Sources** tab — so you see your React components exactly as you wrote them, not the transpiled/minified bundle. In webpack, this is controlled by the `devtool` option. Common values include: (1) `source-map` — generates a full, separate `.map` file with accurate line/column mappings; best for production debugging but increases build time, (2) `eval-source-map` — embeds source maps inside `eval()` calls per module; fast rebuilds, great for development, (3) `cheap-module-source-map` — maps to original lines (not columns) after loader transforms; good balance of speed and accuracy, (4) `hidden-source-map` — generates the `.map` file but does not add the `sourceMappingURL` comment, so the map is not automatically loaded by browsers; useful in production when you want to upload maps to an error tracking service (like Sentry) without exposing them publicly, (5) `false` / `none` — no source maps at all. **In production**, many teams either disable source maps or use `hidden-source-map` to avoid exposing original source code to end users, while still uploading maps to error monitoring tools for readable stack traces. Vite similarly generates source maps via the `build.sourcemap` option in `vite.config.js`.
