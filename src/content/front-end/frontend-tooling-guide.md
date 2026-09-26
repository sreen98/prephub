# Frontend Tooling — Complete Guide

## Table of Contents

- [1. Do We Need a Bundler for React?](#1-do-we-need-a-bundler-for-react)
- [2. Webpack Deep Dive](#2-webpack-deep-dive)
- [3. Vite Deep Dive](#3-vite-deep-dive)
- [4. Webpack vs Vite Comparison](#4-webpack-vs-vite-comparison)
- [5. Other Bundlers Overview](#5-other-bundlers-overview)
- [6. Package Managers — npm vs yarn vs pnpm](#6-package-managers-npm-vs-yarn-vs-pnpm)
- [7. npx](#7-npx)
- [8. package.json Deep Dive](#8-packagejson-deep-dive)
- [9. The 2026 Toolchain](#9-the-2026-toolchain-rust-go-and-consolidation)
- [10. Interview Questions & Answers](#10-interview-questions-answers)

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
const AppV2 = () => _jsx('div', {
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

Webpack still powers a large share of production React apps — it is the incumbent, not the default for new work. Vite is what most new projects start on, and since Vite 8 the performance argument for staying is weaker still (§9.1).

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
import { Routes, Route } from 'react-router-dom';

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
```

```js
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
- The React team recommends a framework (Next.js, React Router) or Vite in the official docs; `create-react-app` was formally deprecated in February 2025

---

## 3. Vite Deep Dive

### 3.1 What is Vite?

Vite (French for "fast", pronounced /vit/) was created by Evan You (creator of Vue.js) and released in 2020. It is a **next-generation frontend build tool** that provides a fundamentally different dev experience from webpack.

Current major version: **Vite 8** (released 12 March 2026), which replaced the old esbuild-in-dev / Rollup-in-production split with **Rolldown** for both — see §9.1. Used by Vue, React, Svelte, Solid, Astro, and many other frameworks.

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

The diagram shows the classic design that Vite 7 and earlier used: esbuild in development, Rollup for the production build. Vite 8 runs Rolldown in both places (§9.1), but the idea this section explains is unchanged — development serves your source files one module at a time, and only the production build produces a full bundle.

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

Why esbuild? It is written in Go and is **10-100x faster** than JavaScript-based bundlers. esbuild's own published benchmark — a production bundle of 10 copies of the three.js library from scratch, with minification and source maps — shows the gap:

| Tool | Time (esbuild's benchmark) |
|---|---|
| esbuild | 0.39 s |
| Parcel 2 | 14.91 s |
| Rollup 4 + Terser | 34.10 s |
| webpack 5 | 41.21 s |

Treat these as a ratio, not a promise: it is one benchmark run by the esbuild project on one machine, and your project's numbers will differ.

esbuild gets this speed from three things: it is compiled native code rather than JavaScript running in Node, it parses files in parallel across all CPU cores, and it makes very few passes over the AST (abstract syntax tree, the in-memory structure a tool builds from your source) where a Babel-plus-webpack pipeline re-parses and re-walks the code several times.

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
// OR: import react from '@vitejs/plugin-react-swc';  — uses SWC, faster

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

| Feature | Webpack 5 | Vite (7 and 8) |
|---|---|---|
| **Dev server architecture** | Bundles everything, serves from memory | Native ES modules, transforms on demand |
| **Dev startup time** | Slow (10-60s for large apps) | Near-instant (<1s) |
| **HMR speed** | Degrades with project size | Constant-time (~50ms) |
| **Production bundler** | Webpack (custom) | Rollup up to Vite 7; **Rolldown** from Vite 8 |
| **Transpiler** | Babel (via babel-loader) | esbuild in dev up to Vite 7; **Rolldown** for both from Vite 8 |
| **Config complexity** | Complex (100-500 line configs typical) | Minimal (20-50 lines typical) |
| **CSS handling** | Requires loaders (css-loader, style-loader, etc.) | Built-in (CSS Modules, PostCSS, Sass with one install) |
| **TypeScript** | Requires ts-loader or babel-loader + @babel/preset-typescript | Built-in (esbuild strips types, no type checking) |
| **Static assets** | Asset modules (type: 'asset') | Built-in, URL imports work out of the box |
| **Environment variables** | `DefinePlugin` with `process.env.*` | `import.meta.env.VITE_*` (no plugin needed) |
| **Code splitting** | Dynamic imports + splitChunks config | Dynamic imports + `build.rollupOptions.output.manualChunks` (`rolldownOptions` from Vite 8) |
| **Tree shaking** | Yes (requires `sideEffects` config) | Yes (Rollup's tree shaking is considered superior) |
| **SSR** | Requires additional setup | Built-in SSR support |
| **Plugin ecosystem** | Massive (10,000+ npm packages) | Growing (Rollup-compatible + Vite-specific) |
| **Learning curve** | Steep | Gentle |
| **Legacy browser support** | Via babel-loader + polyfills | Via `@vitejs/plugin-legacy` |
| **Maturity** | Battle-tested since 2012 | Production-ready since 2021 |

### When to Use Webpack

- **Existing large codebase** already on webpack — migration cost may not be worth it
- **Highly custom build requirements** — webpack's loader/plugin ecosystem is unmatched
- **Module Federation already in use** — webpack 5's runtime module sharing for micro-frontends. Vite had no real equivalent until Vite 8's Rolldown graph added support (§9.1), so an existing federated setup is a reason to stay put rather than a reason Vite cannot do it
- **Need fine-grained control** over every aspect of the build

### When to Use Vite

- **New projects** — React, Vue, Svelte, or any modern framework
- **DX is a priority** — instant server start, fast HMR
- **Migrating from CRA** — Vite is the natural successor
- **Library development** — Vite's library mode uses Rollup, which produces clean output

### Choosing Between Them — The Decision, Not the Feature List

The lists above are the inputs. The question interviewers actually ask is *"which would you pick?"*, and answering it with a feature comparison is the weak answer — it shows you have read a table, not that you have made a call.

**There are two different questions hiding in one, so say which you are answering.**

**Greenfield: Vite, and the reason is not speed.** It is that the ecosystem defaults there now — React's own docs stopped recommending Create React App, and Vue, Svelte, Solid, Astro and Nuxt all ship on it. In 2026, picking webpack for a *new* project needs a positive justification; picking Vite does not.

**An existing webpack app: default to NOT migrating.** This is the answer that separates people who have maintained a build from people who have read about one. A working webpack config is years of accumulated decisions — loaders for odd asset types, `resolve.alias` entries, `DefinePlugin` values, a Jest transform that mirrors it. Replacing it is a rewrite with a long tail of small breakages, and "our dev server starts faster" is rarely worth it on its own.

Three things would change that default:

1. **Dev startup or HMR is slow enough to cost measurable developer time.** Not "it feels slow" — a 60-second cold start paid twenty times a day by ten engineers is three hours a day.
2. **The config has drifted into something nobody understands.** When changing the build is a risk in itself, a rewrite buys comprehension as well as speed.
3. **A major framework upgrade is already underway** and can absorb the churn — migrating the build alongside React 18 → 19 costs far less than a standalone project.

**If the trigger is purely speed, look at Rspack before Vite.** Rspack is a Rust rewrite of webpack that is deliberately **config-compatible** — most `webpack.config.js` files run with minimal edits, and the loader and plugin APIs are the same, so `babel-loader` and friends keep working. You get most of the speed without rewriting the build. Vite is the better *destination*; Rspack is the cheaper *move*. Knowing the difference between an upgrade and a rewrite is the point. (See §5.6.)

**What still legitimately keeps a project on webpack:**

- **A heavy CommonJS or non-standard-module codebase.** Vite assumes ESM. Dynamic `require()`, conditional requires, and `require.context` all fight it.
- **Custom loaders with no Vite equivalent** — fifteen years of loaders for every obscure asset type.
- **Fine-grained chunking control**, though Rolldown's `advancedChunks` narrows this.
- **Module Federation** used to head this list. Vite 8's single Rolldown graph supports it, so it mostly does not any more (§9.1).

**Two honesty notes worth carrying into an interview.**

First, **know which version you actually shipped.** "Vite uses esbuild in dev and Rollup in prod" is correct for Vite 7 and earlier; Vite 8 uses Rolldown for both, and `build.rollupOptions` becomes `build.rolldownOptions`. Check `package.json` before you claim either — being precise about the boundary between what you have read and what you have run is itself a signal.

Second, **do not imply you led a migration you did not lead.** "Webpack on one project, Vite on another, different eras" is a complete and respectable answer. Claiming a migration invites specifics — CommonJS interop, `process.env` vs `import.meta.env`, path aliases, the Jest config that has to move too — and not having hit them shows immediately.

**The strongest material is not this list at all.** It is a bundling decision you made and can defend: a chunk you split and why, a glob you made lazy, an output filename you changed because it collided with something. Those demonstrate that you understand what the bundler does to your module graph, which is the competency underneath the whole comparison.

---

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
- Used by Vite as the production bundler up to Vite 7 (Vite 8 switched to Rolldown, a Rust reimplementation of Rollup's API)
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
- Used by Vite for dependency pre-bundling and dev transforms up to Vite 7
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
- Scope hoisting — concatenating modules into one scope instead of wrapping each in its own function, which makes output smaller and lets the minifier drop more unused code (the same technique Rollup uses)
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
- Introduced as the dev server in **Next.js 13** behind `next dev --turbo`
- Claims up to **700x faster** than webpack for large apps (hot updates)
- **Default for both dev and production builds in Next.js 16** — the dev-only limitation is historical (§9.2)
- Still not available as a standalone bundler outside Next.js

```bash
# Use Turbopack in Next.js
npx next dev --turbo
```

**When to use:** If you are on Next.js 16 you are already using it — it is the default for both `next dev` and `next build`. Earlier Next.js versions offered it for dev only, behind the `--turbo` flag shown above. It is not usable outside Next.js.

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

### 5.6 Rspack

**What:** A Rust rewrite of webpack from ByteDance. Its first public release (0.1) was in March 2023, the stable 1.0 shipped in August 2024, and 2.0 followed in April 2026. Its defining choice is **config compatibility** — it aims to run your existing `webpack.config.js`.

**Key characteristics:**
- **Webpack-compatible config, loaders and plugin API** — `babel-loader`, `css-loader`, `MiniCssExtractPlugin` and most of the ecosystem work unchanged
- ~10× faster builds than webpack on comparable projects
- Supports **Module Federation**, which matters for micro-frontends
- Backs Rsbuild (a batteries-included wrapper) and Rspress/Rslib

```js
// rspack.config.js — deliberately familiar
module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'builtin:swc-loader' },   // built-in, replaces babel-loader
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
};
```

**Why it matters for the webpack-vs-Vite decision:** it reframes the question. The usual choice is presented as "stay slow or rewrite", and Rspack is the third door — most of the speed for a fraction of the migration cost, because you are keeping the loader and plugin layer rather than replacing it. For an existing webpack codebase where the *only* complaint is build time, it is usually the right first move, with Vite as the longer-term destination if the config is also a liability.

**When not to:** greenfield work (just use Vite), or a config so small that migrating it properly was never expensive.

### 5.7 Bundler Comparison Summary

| Feature | Webpack | Vite | Rollup | esbuild | Parcel | Turbopack |
|---|---|---|---|---|---|---|
| **Language** | JS | JS | JS | Go | JS + SWC (Rust) | Rust |
| **Primary use** | Applications | Applications | Libraries | Build tool component | Applications | Next.js (dev and build) |
| **Config** | Complex | Minimal | Moderate | Minimal | Zero | N/A (Next.js) |
| **Dev speed** | Slow | Fast | N/A | N/A | Medium | Fastest |
| **Tree shaking** | Good | Great (Rollup; Rolldown from Vite 8) | Best | Good | Good | N/A |
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

**npm** ships with Node.js and is the default package manager. Node.js 24 ships **npm 11**; npm's own latest line is **12.x**. The version that matters is whichever your Node installs — check with `npm -v` rather than assuming.

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

**pnpm** (performant npm) was created by Zoltan Kochan in 2017. It takes a radically different approach to package storage. **pnpm 11** (April 2026) tightened the supply-chain defaults introduced through v10 and replaced the JSON-per-package store index with a single SQLite database; the current line is **12.x**.

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

| Feature | npm 11+ | Yarn Classic 1.x | Yarn Berry 4.x | pnpm 11+ |
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

These are illustrative round numbers, not measurements — they show the relative order, and real times vary a lot with project size, network speed, hardware and tool version. For measured figures, pnpm publishes a regularly re-run benchmark at pnpm.io/benchmarks (it compares npm and pnpm). The key takeaways:
- pnpm and Yarn PnP are fastest for cold installs
- Yarn PnP with zero-installs is fastest overall (no install step at all)
- npm is the slowest but has improved significantly since npm 7

### 6.7 When to Use Which

**npm** — Default choice. Zero setup, and every tutorial and CI image assumes it. Use it unless you have a specific problem (disk use, phantom dependencies, a large monorepo) that one of the others solves.

**Yarn Classic** — Legacy choice. Many existing projects use it. Workspaces work well. If starting new, consider Yarn Berry or pnpm instead.

**Yarn Berry (PnP)** — For teams willing to live without `node_modules/`. The payoff is zero-installs: with the package cache committed, CI skips the install step entirely. The cost is that tools which assume a `node_modules/` folder exists need patches or editor SDKs, and chasing those down is where teams lose time.

**pnpm** — The usual pick for monorepos. Each package version is stored once on disk and hard-linked into projects, so installs are fast and disk use is low; and because only declared dependencies are linked at the top of `node_modules/`, a phantom dependency fails immediately instead of working by accident. Used by Vue, Vite, and many large open-source projects.

---

## 7. npx

### 7.1 What is npx?

`npx` (Node Package Execute) ships with npm 5.2+ (2017). It executes npm package binaries without requiring a global install.

### 7.2 How npx Works

```bash
npx create-vite@latest my-app
```

What happens:
1. Check if `create-vite` exists in the local project (`node_modules/.bin/`)
2. If not, check if it exists globally
3. If not, ask before installing it (skip the prompt with `--yes`), install it into a folder inside the **npm cache**, and run it from there

Nothing is added to your global installs, and the copy stays in the cache rather than being deleted. Version pinning matters: a name with no version (`npx create-vite`) is matched against whatever version the project already has installed, so ask for `@latest` (as above) when you specifically want the newest release.

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
| `peerDependencies` | Auto-installed by npm 7+ (npm 3–6 only warned if missing) | "I need this, but the consumer should provide it" | react (for a React component library) |
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

## 9. The 2026 Toolchain — Rust, Go, and Consolidation

Everything above describes the tooling world as it was built. This section describes where it landed, because 2025–26 was the year the whole JavaScript toolchain got rewritten in native languages and then *consolidated*. Interviewers ask about it not to test trivia but to see whether you understand the pattern: every layer of the pipeline that was written in JavaScript has been replaced by a native implementation, and the fragmentation that followed is now collapsing back into single tools.

### 9.1 Vite 8 and Rolldown — One Bundler Instead of Two

Vite's original design had a structural oddity: **dev used esbuild, production used Rollup.** That gave the best of both — esbuild's speed for dependency pre-bundling and transform, Rollup's superior tree-shaking and code splitting for the final bundle — at the cost of two different module graphs, two plugin behaviours, and the classic "works in dev, breaks in build" bug class.

**Rolldown** was built to end that: a Rust implementation of Rollup's API, from the Oxc project. It hit **1.0 on 7 May 2026** with a locked API, and **Vite 8 (12 March 2026) ships it as the single default bundler for both dev and production**, no opt-in.

| Aspect | Vite ≤7 | Vite 8 |
|---|---|---|
| Dev transform | esbuild | Rolldown |
| Production bundle | Rollup | Rolldown |
| Module graph | two | **one** |
| Build speed | baseline | **10–30× faster** on large projects |

The interesting part is not the speed number — it is what a single graph unlocks, which was awkward or impossible before:

- **Full bundle mode in dev.** Vite's unbundled-ESM dev server was brilliant for small apps but degrades on very large ones, where the browser opens thousands of module requests. One bundler means dev can bundle when that's faster.
- **Module-level persistent caching** across restarts, because there's one canonical representation to cache.
- **Flexible chunk splitting** and **Module Federation** support — the last real reason teams stayed on webpack for micro-frontends.

Migration is mostly a version bump, but two things bite. `@vitejs/plugin-react` v6 dropped Babel, so React Compiler is wired in differently than the Babel-plugin recipe in most 2025 tutorials. And any plugin reaching into Rollup internals rather than using the public plugin API may need updating — the API is compatible, the internals are not.

### 9.2 Turbopack — Next.js Went the Same Way

**Next.js 16 (21 October 2025) removed webpack as the default and ships Turbopack as the only bundler out of the box** — 5–10× faster Fast Refresh, builds up to 5× faster, plus filesystem caching (beta) that cuts cold-start time on large projects.

The parallel with Vite 8 is the point worth making in an interview: both ecosystems independently concluded that a JavaScript-based bundler could not get fast enough, and both replaced it with Rust. Turbopack is Vercel's, built for Next's specific needs (RSC graph, route-based splitting); Rolldown is community-owned and Rollup-compatible, which is why it could become Vite's default without breaking the plugin ecosystem.

### 9.3 Linting and Formatting — Flat Config, oxlint, Biome

Three changes here, and they interact.

**ESLint flat config is now the only config.** ESLint v9 made `eslint.config.js` the default; **ESLint v10 (February 2026) removed the `eslintrc` system entirely** — no `.eslintrc.json`, and the CLI dropped `--no-eslintrc`, `--env`, `--rulesdir`, `--ignore-path` and `--resolve-plugins-relative-to`. Config resolution also changed: ESLint now looks for config starting from **each linted file's directory** rather than the working directory, which quietly fixes monorepos. The migration is mechanical:

```bash
npx @eslint/migrate-config .eslintrc.json     # emits eslint.config.mjs
```

```js
// eslint.config.mjs — flat config is plain JS, no cascade, no `extends` string magic
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  reactHooks.configs['recommended-latest'],   // includes React Compiler rules (v6+)
  { files: ['**/*.test.ts'], rules: { 'no-console': 'off' } },
];
```

Flat config's real advantage is conceptual: it's an **array of objects evaluated in order**, so "which rule applies to this file and why" is answerable by reading top to bottom. The old cascading system resolved `extends` chains, `overrides` and directory inheritance in a way nobody could predict without running `--print-config`.

**The native linters.** Two Rust contenders, and they are aiming at different jobs:

| Aspect | **ESLint + typescript-eslint** | **oxlint** (Oxc) | **Biome** |
|---|---|---|---|
| Speed | baseline | **~30× faster** on syntax rules | very fast |
| Custom rules / plugins | **mature, huge ecosystem** | growing | limited |
| Formatter included | no (Prettier) | `oxfmt` (separate) | **yes — replaces Prettier too** |
| Type-aware rules | **full — runs `tsc`** | via **tsgo** (TS 7's Go compiler) → real `tsc` semantics | approximated *without* running `tsc` |
| Best at | correctness coverage, framework plugins | a millisecond pre-commit pre-check | replacing ESLint **and** Prettier with one tool |

The honest 2026 positioning: **ESLint + typescript-eslint is still the reference** for rule coverage and framework plugins, and it is what every other tool is measured against. **oxlint** is designed to run *alongside* it as a sub-second pre-check on the common mistakes, and its type-aware rules are notable because they delegate to **tsgo** — the same Go compiler as TypeScript 7 — so its type semantics match `tsc` exactly rather than approximating. **Biome** is the "one tool, one config" play: it replaces ESLint *and* Prettier, which is a genuine simplification, but its type-aware rules approximate type information rather than running the compiler, so coverage thins out on heavily generic code.

Note the shared foundation: **Oxc** is a whole Rust toolchain — parser, resolver, transformer, linter (`oxlint`), formatter (`oxfmt`) — and **Rolldown is built on it**. That is why Vite 8 and oxlint are related news rather than coincidence.

### 9.4 Type-Checking Went Native Too

The last JavaScript-speed step in a front-end build was `tsc`. **TypeScript 7 (8 July 2026) is the compiler rewritten in Go**, 8–12× faster, shipping as the normal `tsc` in the `typescript` package. See the TypeScript guide §13.2 for the details and the upgrade caveat (the programmatic API is not stable in 7.0, so Vue/Svelte/Astro tooling stays on 6.0).

This closes the loop. Before 2026 a typical pipeline was: native transform (esbuild/SWC) → JavaScript bundle (Rollup/webpack) → JavaScript type-check (`tsc`) → JavaScript lint (ESLint). The two JavaScript steps dominated the wall clock, which is why "use `transpileOnly` and type-check in a separate CI job" became standard advice. With Rolldown, tsgo and oxlint, every stage is native and that workaround is no longer necessary.

### 9.5 What To Actually Pick

```
New React SPA           → Vite 8 (Rolldown default). Nothing to configure.
New full-stack app      → Next.js 16 (Turbopack default) or Remix/React Router.
Library                 → Rolldown or tsdown; keep Rollup if you depend on niche plugins.
Micro-frontends         → Vite 8 Module Federation, or webpack if the setup already exists.
Linting, pragmatic      → ESLint 10 flat config + typescript-eslint, oxlint as a pre-commit pre-check.
Linting, greenfield     → Biome, if you value one tool over maximum rule coverage.
Type-checking           → TypeScript 7, unless you use Vue/Svelte/Astro tooling → stay on 6.0.
Monorepo                → pnpm workspaces + Turborepo or Nx for task orchestration and caching.
```

The framing that scores best: name the *pattern* rather than the versions. Every layer has been rewritten in a native language for speed, and the industry is now consolidating from many single-purpose tools toward a few integrated ones (Vite+Rolldown, Biome, Oxc). The trade-off you accept in exchange is **ecosystem maturity** — the fast tool usually has fewer plugins and less battle-tested edge-case handling, which is why the sensible pattern for an existing codebase is to add the fast tool as a pre-check rather than swap out the mature one on day one.

---

## 10. Interview Questions & Answers

### Beginner

**Q1: What is a bundler and why do React apps need one?**

A bundler takes your source files (JS, JSX, CSS, images) and turns them into a small number of optimised files the browser can load. A React app needs one because what you write is not what a browser can run efficiently:

1. **Browsers cannot parse JSX.** It must be transpiled (rewritten) to plain JavaScript by Babel, SWC or esbuild.
2. **Bare imports do not resolve.** `import React from 'react'` names a package, not a URL, and the browser has no idea where `node_modules` is.
3. **Hundreds of small files are slow.** Loading every module as its own HTTP request creates a waterfall, because the browser only discovers each import after downloading the file that contains it.
4. **Production needs optimisation.** Tree shaking (removing unused exports), code splitting, minification and asset hashing all need a tool that sees the whole app at once.

---

**Q2: What is the difference between dependencies and devDependencies?**

`dependencies` are packages required at runtime in production — React, React Router, Axios, etc. They are always installed. `devDependencies` are packages needed only during development or build — Vite, TypeScript, ESLint, Jest, `@types/*` packages. In production deployments, `npm install --omit=dev` skips devDependencies. For frontend apps built into static files, this distinction matters less (everything is used at build time), but it is critical for npm packages and Node.js servers. The convention is: if the user's browser needs it at runtime, it is a dependency; if only the developer's machine needs it, it is a devDependency.

---

**Q3: What does the `^` (caret) mean in `"react": "^18.2.0"`?**

The caret means "compatible with" — it allows updates that do not change the leftmost non-zero digit. For `^18.2.0`, it matches any version `>=18.2.0` and `<19.0.0`. This allows minor and patch updates (18.2.1, 18.3.0) but blocks major updates (19.0.0). The caret is the default range operator when you run `npm install react`. It relies on the semver convention that major versions contain breaking changes, while minor and patch versions are backward-compatible.

---

**Q4: What is npx and how is it different from npm?**

`npm` is a package manager — it installs and manages dependencies. `npx` is a package runner — it executes binaries from npm packages. The key difference: `npx create-vite my-app` fetches `create-vite` into the npm cache (not your global installs) and runs it from there. Without npx, you'd need `npm install -g create-vite` then `create-vite my-app`, polluting your global installs. npx also runs local project binaries: `npx eslint .` finds and runs `./node_modules/.bin/eslint` without needing a script in package.json.

---

**Q5: What is the purpose of a lock file (package-lock.json)?**

A lock file records the exact version, download URL, and integrity hash of every installed package (including transitive dependencies). Without it, `npm install` resolves version ranges at install time, which can produce different results on different machines or at different times (if a new version was published). The lock file ensures **reproducible builds** — every developer and CI machine gets identical `node_modules/`. You should always commit the lock file. In CI, use `npm ci` (which reads only from the lock file) instead of `npm install`.

---

### Intermediate

**Q6: How does webpack's dependency graph work?**

Webpack starts at the entry point (e.g. `./src/index.js`) and follows every `import` and `require()` it finds, file by file, until it has a map of every module the app uses and which module imports which. For each file it:

1. **Resolves** the import path to a real file, using `resolve.extensions` and `resolve.alias`.
2. **Transforms** the file with any matching loaders (e.g. `babel-loader` turns JSX into JavaScript). This comes first because webpack can only read imports out of JavaScript.
3. **Parses** the transformed output for more imports.
4. **Repeats** for each newly found file.

The finished graph holds every module, its dependencies and its transformed code. Webpack then groups modules into chunks (one per entry point, plus one per dynamic `import()`) and writes them out. Having the whole graph is what makes the two big optimisations possible: tree shaking (dropping exports nothing imports) and code splitting (chunks loaded on demand).

---

**Q7: Explain how Vite's dev server works and why it's faster than webpack's.**

Vite's dev server leverages native ES modules in the browser. Instead of bundling the entire app before serving (like webpack), Vite: (1) serves `index.html` with a `<script type="module">` tag, (2) the browser parses each file and sends HTTP requests for imports, (3) Vite transforms files on-demand (JSX to JS, TypeScript stripping — esbuild up to Vite 7, Rolldown from Vite 8), (4) only the requested module is processed. For `node_modules`, Vite pre-bundles them into single files (with esbuild up to Vite 7, which is 10-100x faster than webpack), cached in `node_modules/.vite/`. The result: server starts in milliseconds regardless of project size, because Vite only processes files the browser actually requests. HMR is also faster because only the changed module needs re-transformation, not an entire chunk rebuild.

---

**Q8: What is tree shaking and what are the requirements for it to work?**

Tree shaking is removing code that nothing uses. At build time the bundler reads every `import` and `export`, works out which exports are never imported, and leaves them out of the bundle. It needs three things:

1. **ES modules, not CommonJS.** `import`/`export` are fixed at the top of a file, so a tool can read them without running the code. `require()` is an ordinary function call that can take a computed name, so the bundler cannot know in advance what it will load.
2. **Optimisation switched on** — production mode in webpack, or the equivalent in your bundler.
3. **A `sideEffects` hint in `package.json`.** Set it to `false`, or list only the files that do something on import (such as CSS). Without it the bundler must keep an unused module in case importing it changes something, like registering a global.

Common pitfall: importing a whole CommonJS library (`import _ from 'lodash'`) defeats tree shaking. Use named imports from an ES-module build instead (`import { debounce } from 'lodash-es'`).

---

**Q9: How does pnpm's content-addressable store differ from npm's node_modules?**

npm copies package files into each project's `node_modules/` directory. If ten projects use React 18.2.0, there are ten copies on disk. pnpm stores every package file once in a global content-addressable store (keyed by file content hash). In each project, `node_modules/.pnpm/` contains hard links (not copies) pointing to the store. Hard links share the same disk blocks, so there is zero additional disk usage. pnpm also uses a non-flat `node_modules/` structure with symlinks, which prevents phantom dependencies — you can only import packages declared in your `package.json`. This is stricter than npm's hoisted flat structure, where you can accidentally import transitive dependencies.

---

**Q10: What are peerDependencies and when should you use them?**

`peerDependencies` declare that your package requires a dependency to be provided by the consuming application, rather than bundling its own copy. The canonical use case is React component libraries: if your UI library lists React in `dependencies`, the consuming app may end up with two copies of React (its own and the library's), which breaks hooks, context, and reconciliation. By listing React in `peerDependencies`, you're telling npm: "I need React, but the app will provide it — don't install a separate copy." npm 7+ auto-installs peer dependencies and warns on conflicts. Use `peerDependencies` for framework dependencies (react, vue, angular), plugin host packages (eslint for eslint plugins), or any dependency where multiple instances cause problems.

---

### Advanced

**Q11: Explain webpack's code splitting strategies and how splitChunks works.**

Webpack splits code in three ways:

1. **Multiple entry points** — a separate bundle per page (`entry: { home: './home.js', admin: './admin.js' }`).
2. **Dynamic imports** — `import('./Module')` becomes its own chunk, downloaded only when that line runs (this is what `React.lazy()` uses).
3. **`splitChunks`** — webpack pulls modules that several chunks share into a common chunk automatically, so they are downloaded once.

`splitChunks` is configured with `cacheGroups`, each a rule for one kind of shared chunk:

- `test` — a regex choosing which modules belong to the group
- `chunks` — which chunks to split from: `'all'`, `'async'` or `'initial'`
- `minSize` — don't split out anything smaller than this
- `minChunks` — how many chunks must share a module before it is extracted
- `priority` — which group wins when a module matches more than one

A common setup is a `vendor` group for `node_modules`, a `react` group for React/ReactDOM and a `common` group for shared app code. The point is caching: code that rarely changes sits in its own file, so its content hash (and the browser's cached copy) survives a deploy that only touched app code. `runtimeChunk: 'single'` does the same for webpack's small runtime, so a change to it does not change every other chunk's hash.

---

**Q12: How does Vite handle the production build differently from development?**

Short answer: development serves each source file separately and transforms it on request; production builds one optimised bundle, because the browser tricks that make dev fast would make a real site slow. (Up to Vite 7 the production bundler was Rollup; Vite 8 uses Rolldown for both, but the dev-versus-build split described here still holds.) The reasons production must bundle: (1) native ES modules in production would cause a waterfall of HTTP requests — the browser discovers imports sequentially, each requiring a round trip, (2) production needs tree shaking, which requires analyzing the entire module graph, (3) code splitting for optimal chunk loading requires global knowledge of the dependency graph, (4) minification, asset hashing, and CSS extraction need a full build pass. Vite configures Rollup with sensible defaults: automatic code splitting at dynamic import boundaries, CSS code splitting (each async chunk gets its own CSS), asset URL handling with content hashing, and minification via esbuild (faster than Terser). The `build.rollupOptions` field exposes Rollup's full configuration for advanced customization like `manualChunks`.

---

**Q13: What is Yarn PnP and what problems does it solve?**

Yarn Plug'n'Play (PnP) gets rid of the `node_modules/` folder. Yarn keeps each package as a `.zip` file in `.yarn/cache/` and writes a `.pnp.cjs` file that maps every package name and version to where it lives. When Node.js looks for a module, the PnP runtime answers from that map and reads the file straight out of the zip.

What it solves:

1. **No phantom dependencies** (packages you import without declaring them). PnP only resolves what your `package.json` lists, so an undeclared import fails at once instead of working by accident.
2. **Faster installs.** Writing thousands of small files into `node_modules/` is the slow part of an install; PnP writes one zip per package.
3. **Less disk space**, because zips are smaller than unpacked folders.
4. **Deterministic resolution.** There is no hoisting (moving packages up the folder tree) whose result can vary between installs.
5. **Zero-installs.** Commit `.yarn/cache/` and CI needs no install step at all.

The cost: packages that walk `node_modules/` themselves (e.g. with `__dirname`) break, and editors need Yarn's SDKs to find types and tools.

---

**Q14: Compare the production output of webpack vs Rollup (used by Vite). Which produces better tree-shaking results?**

Rollup generally produces better tree-shaking results because it was designed from the ground up for ES modules. Rollup uses "scope hoisting" — it places all modules in a single scope, which allows the minifier to see and eliminate more dead code. Webpack wraps each module in a function closure (`__webpack_require__`), which creates scope boundaries that can prevent some dead code elimination. Webpack 5 added "concatenateModules" optimization (ModuleConcatenationPlugin) to achieve similar scope hoisting for ES modules, closing the gap significantly. In practice, the difference matters most for library authors where every byte counts. For applications, both produce well-optimized output. Rollup's output is also more readable (useful for libraries consumers might debug), while webpack's output includes more runtime overhead for module loading. Up to Vite 7, Vite used Rollup for production and esbuild for minification, combining Rollup's tree shaking with esbuild's speed; Vite 8 does both with Rolldown.

---

**Q15: You run `npm install` on a fresh machine and get different packages than your coworker. What went wrong and how do you prevent it?**

Almost always, the install was resolved from version ranges instead of from a lock file. The usual causes:

1. **No lock file committed.** `package.json` holds ranges like `^18.2.0`, so if 18.3.0 was published between your coworker's install and yours, you each get a different version. Fix: always commit `package-lock.json`.
2. **`npm install` where `npm ci` belonged.** `npm install` may update the lock file; `npm ci` installs exactly what the lock file says and fails if it disagrees with `package.json`.
3. **Different npm versions**, which can resolve the same ranges differently. Fix: declare the version with the `engines` and `packageManager` fields, and run `corepack enable` so the declared manager is used.
4. **A stale lock file.** Someone edited `package.json` by hand and never ran `npm install`, so the lock file no longer matches it.
5. **A different registry** (rare) — a private mirror, or a package that was unpublished.

Prevention: commit the lock file, use `npm ci` in CI, pin the package-manager version, and set the registry in `.npmrc`.

---

**Q16: Explain the role of SWC and esbuild in the modern frontend toolchain. Are they bundlers?**

Mostly no. They are fast building blocks that bundlers are made from, not the bundler most apps use directly.

**SWC** (Speedy Web Compiler) is a Rust compiler — a drop-in replacement for Babel. It transforms JSX, strips TypeScript, downlevels new syntax for older browsers and minifies, around 20x faster than Babel. Next.js (since v12), Parcel 2 and Vite (via `@vitejs/plugin-react-swc`) use it. It does not bundle.

**esbuild** is written in Go and is both a bundler and a transpiler, but in the ecosystem it is used mainly as the fast transpiler and minifier inside other tools. Up to Vite 7, Vite used it for:

1. dependency pre-bundling in development
2. TypeScript/JSX transformation during dev
3. minification in production builds

Vite 8 moved all three onto Rolldown.

Why they do not replace webpack/Vite/Rollup for application bundling: esbuild's plugin API is limited and its code splitting is basic, and SWC is a compiler, not a bundler. The pattern is a division of labour — Rust and Go tools do the CPU-heavy work (parsing, transforming, minifying), and the JavaScript tools around them handle orchestration and the plugin ecosystem.

---

**Q17: What is Module Federation in webpack 5 and why doesn't Vite have an equivalent?**

Short answer: Module Federation lets separately built and deployed apps load each other's code at runtime. The premise of the question is now dated — Vite 8 supports it through Rolldown (§9.1) — so the strong answer explains why Vite *used* to lack it, then corrects the premise.

Module Federation is a webpack 5 feature that allows independently built and deployed applications to share modules at runtime. Application A can expose a React component, and Application B can consume it without having it at build time — the module is loaded over the network at runtime. This enables **micro-frontends**: separate teams build and deploy their features independently, and a shell application composes them. Key concepts: `exposes` (modules this build makes available), `remotes` (other builds to consume modules from), and `shared` (dependencies that should be deduplicated at runtime, e.g., React). Vite ≤7 had no built-in equivalent because Module Federation needs a runtime module loader that is deeply integrated into the bundler's module format, and Vite ran two different tools (esbuild in dev, Rollup in production) with no single runtime to build it into. Community plugins (`vite-plugin-federation`) offered partial compatibility. Vite 8's single Rolldown graph is what made native support possible, so federation is no longer a reason on its own to choose webpack for new work — though an existing webpack federation setup is still a reason not to migrate in a hurry.

---

**Q18: How do you analyze and optimize a webpack/Vite production bundle?**

For webpack: use `webpack-bundle-analyzer` (generates an interactive treemap of chunk contents) or `source-map-explorer` (analyzes source maps). For Vite: use `rollup-plugin-visualizer` or `vite-bundle-visualizer`. Key optimization steps: (1) **Identify large dependencies** — look for libraries that are disproportionately large (moment.js → day.js, lodash → lodash-es with tree shaking), (2) **Code split aggressively** — `React.lazy()` for route-level splitting, dynamic `import()` for heavy features, (3) **Configure manualChunks** — separate vendor code (long cache) from app code (frequent changes), (4) **Enable tree shaking** — use ES module imports, set `sideEffects: false`, avoid barrel files that re-export everything, (5) **Check for duplicates** — multiple versions of the same package (inspect lock file), (6) **Lazy-load heavy libraries** — Mermaid, Babel, chart libraries loaded on demand, (7) **Use `import()` for conditional features** — admin panels, analytics scripts.

---

**Q19: Explain the difference between `npm install`, `npm ci`, and `npm install --production`.**

`npm install` reads `package.json`, resolves the version ranges for all dependencies, downloads and installs them into `node_modules/`, and updates `package-lock.json` if needed. It's flexible — it can add new packages and update the lock file. `npm ci` (clean install) deletes `node_modules/` entirely, reads only from `package-lock.json` (ignoring `package.json` ranges), installs the exact versions recorded, and fails if the lock file is out of sync with `package.json`. It is faster and deterministic — ideal for CI/CD. `npm install --omit=dev` (formerly `--production`) skips `devDependencies`, installing only `dependencies`. Used for production Node.js servers where you don't need build tools. For frontend apps, `devDependencies` are needed at build time, so you typically run `npm ci` (all deps) then `npm run build` in CI.

---

**Q20: A junior developer asks whether to use webpack or Vite for a new React project. What do you recommend and why?**

Vite, and the reason to lead with is not speed. It is that the ecosystem defaults there now: the React docs (react.dev) no longer recommend Create React App and list Vite-based setups as the default, and Vue, Svelte, Solid, Astro and Nuxt all ship on it. Picking webpack for a **new** project in 2026 needs a positive justification; picking Vite does not.

The supporting reasons, in the order they actually matter: the dev server starts in under a second regardless of project size and HMR is near-instant; the config is 20–50 lines rather than 100–500; TypeScript, CSS Modules, PostCSS and static assets work with no loader configuration; and production output goes through Rollup (Rolldown from Vite 8), which tree-shakes well.

**The gotcha to volunteer, because it catches teams out:** Vite transpiles TypeScript without type-checking it. esbuild — and now Rolldown — strip the types and move on, so `vite build` succeeds on code with type errors. You need `tsc --noEmit` in CI or `vite-plugin-checker` in dev. Webpack's `ts-loader` type-checks by default, so this is a real behavioural difference, not a footnote.

---

**Q21: And for an existing webpack application — would you migrate it to Vite?**

This is the more interesting version of the question, and the strong answer starts with **no, by default.**

A working webpack config is years of accumulated decisions: loaders for odd asset types, `resolve.alias` entries, `DefinePlugin` values, a Jest transform that mirrors it. Replacing it is a rewrite with a long tail of small breakages, and "the dev server starts faster" rarely justifies that on its own.

Three things would change the default: dev startup or HMR slow enough to cost **measurable** developer time (a 60-second cold start, paid twenty times a day across ten engineers, is three hours a day — not "it feels slow"); a config that nobody understands any more, where a rewrite buys comprehension as well as speed; or a major framework upgrade already underway that can absorb the churn.

**And if the trigger is purely speed, look at Rspack before Vite.** It is a Rust rewrite of webpack that is deliberately config-compatible — most `webpack.config.js` files run with minimal edits, and the loader and plugin APIs are unchanged, so `babel-loader` and the rest keep working. You get most of the speed without rewriting the build. Vite is the better *destination*; Rspack is the cheaper *move*, and distinguishing an upgrade from a rewrite is the judgement being tested.

What still legitimately keeps a project on webpack: a heavy CommonJS or non-standard-module codebase (Vite assumes ESM, and `require.context` or conditional `require()` will fight it), custom loaders with no Vite equivalent, and fine-grained chunking control — though Rolldown's `advancedChunks` narrows that last one. Module Federation used to head this list; Vite 8's single Rolldown graph supports it, so it mostly does not any more (§9.1).

**Two honesty notes.** Know which version you actually shipped — "esbuild in dev, Rollup in prod" is correct for Vite 7 and earlier, while Vite 8 uses Rolldown for both and `build.rollupOptions` becomes `build.rolldownOptions`. And do not imply you led a migration you did not lead: "webpack on one project, Vite on another, different eras" is a complete answer, whereas claiming a migration invites specifics about CommonJS interop, `process.env` vs `import.meta.env`, path aliases and the Jest config that has to move too.

**The strongest material is none of the above.** It is a bundling decision you made and can defend — a vendor chunk you split so dependency hashes survive a deploy, a glob you made lazy because it was inlining megabytes into the entry chunk, an output filename you changed because it collided with a library's own `index.js` and poisoned a service-worker precache glob. Those show you understand what the bundler does to your module graph, which is the competency the whole comparison is a proxy for.

---

**Q22: How can you see the original React source code in browser DevTools even though webpack bundles everything into a single (or few) output file(s)?**

Short answer: **source maps**. The build writes a `.map` file next to each bundle, and DevTools uses it to show you the original files instead of the bundled output.

A source map is a JSON file (e.g. `main.js.map`) that records, for every position in the bundled output, the file, line and column it came from in your source. The bundle ends with a `//# sourceMappingURL=main.js.map` comment; DevTools sees it, fetches the map, and rebuilds your original file tree under the **Sources** tab — your React components as you wrote them, with breakpoints that land on the right line.

In webpack the `devtool` option controls this, and the choice is a trade between build speed and accuracy:

- `source-map` — a full, separate `.map` file with exact line and column mappings. Most accurate, slowest to build.
- `eval-source-map` — maps embedded per module inside `eval()` calls. Fast rebuilds, good for development.
- `cheap-module-source-map` — maps lines but not columns. A middle ground.
- `hidden-source-map` — writes the `.map` file but leaves out the `sourceMappingURL` comment, so browsers never load it. You upload the map to an error tracker (such as Sentry) to get readable stack traces without publishing your source.
- `false` — no source maps.

**In production**, the usual choice is either no maps or `hidden-source-map`, because a linked map hands your original source to anyone who opens DevTools. Vite does the same job through the `build.sourcemap` option in `vite.config.js`.

---

**Q23: Vite used two different bundlers. What were they, why, and what changed in Vite 8?**

Vite's original architecture split the job: **esbuild** for dev (dependency pre-bundling and per-file transform, chosen for raw speed) and **Rollup** for production (chosen for the best tree-shaking and code-splitting output in the ecosystem). That was a pragmatic best-of-both, but it meant **two module graphs and two plugin pipelines**, which produced the "works in dev, breaks in build" bug class — a plugin or a subtle import-resolution difference behaving one way under esbuild and another under Rollup.

**Vite 8 (March 2026) replaced both with Rolldown**, a Rust implementation of Rollup's API from the Oxc project (Rolldown hit 1.0 in May 2026 with a locked API). One bundler, one graph, dev and prod, no opt-in. Builds are 10–30× faster on large projects.

The speed is the headline, but the architectural wins are the better answer:

- **A single module graph** eliminates dev/prod divergence entirely.
- **Full bundle mode in dev** becomes possible — Vite's unbundled-ESM dev server is excellent for small apps but degrades on very large ones where the browser opens thousands of module requests.
- **Module-level persistent caching** across restarts, since there's one canonical representation to cache.
- **Module Federation** support, which was the last real reason micro-frontend teams stayed on webpack.

Migration caveats worth naming: `@vitejs/plugin-react` v6 dropped Babel, so React Compiler is wired up differently from the Babel-plugin recipe in most 2025 tutorials; and plugins that reach into Rollup *internals* rather than the public plugin API may need updating — the API is compatible, the internals are not.

---

**Q24: `eslintrc` no longer works after an upgrade. What happened, and what does flat config change conceptually?**

**ESLint v10 (February 2026) removed the `eslintrc` config system entirely.** Flat config (`eslint.config.js` / `.mjs`) became the default in v9 and is now the only option. The CLI also dropped every eslintrc-specific flag — `--no-eslintrc`, `--env`, `--rulesdir`, `--ignore-path`, `--resolve-plugins-relative-to` — and the `ESLINT_USE_FLAT_CONFIG` escape hatch is gone. Migration is mechanical:

```bash
npx @eslint/migrate-config .eslintrc.json     # emits eslint.config.mjs
```

The conceptual change is what interviewers are after. Flat config is **a plain JavaScript array of config objects, evaluated in order**, where later entries override earlier ones:

```js
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  reactHooks.configs['recommended-latest'],
  { files: ['**/*.test.ts'], rules: { 'no-console': 'off' } },
];
```

Compare that to the old system, which resolved a cascade of `extends` strings, `overrides` blocks and directory-level `.eslintrc` inheritance through rules almost nobody could predict without running `eslint --print-config`. Three concrete improvements: **plugins are imported**, so resolution follows normal Node semantics instead of ESLint's bespoke name-mangling and `--resolve-plugins-relative-to` hacks; **config is real code**, so you can compute it, share it as a package, or conditionally include a block; and **precedence is positional**, so "which rule applies here and why" is answerable by reading top to bottom.

One behavioural change that catches monorepos: v10 resolves config starting from **each linted file's directory** rather than the process working directory — which is what you always wanted, but it means a nested package's config now applies where previously the root config may have won.

---

**Q25: Would you replace ESLint with Biome or oxlint? How do you decide?**

Rarely a straight replacement, and the reasoning matters more than the pick. The three tools are optimising for different things:

| Aspect | **ESLint + typescript-eslint** | **oxlint** | **Biome** |
|---|---|---|---|
| Speed | baseline | ~30× faster (syntax rules) | very fast |
| Rule/plugin ecosystem | **mature, huge** | growing | limited |
| Formatting | separate (Prettier) | separate (`oxfmt`) | **included** |
| Type-aware rules | **full — runs `tsc`** | via **tsgo** (TS 7's Go compiler) — real `tsc` semantics | approximated, no `tsc` |

**ESLint + typescript-eslint remains the reference** for rule coverage, framework plugins (React Hooks, jsx-a11y, import ordering) and custom in-house rules. If you have any of those, it stays.

**oxlint** is built to run **alongside** ESLint, not instead of it — a sub-second pre-commit or pre-push check that catches the common mistakes in milliseconds while the full ESLint run happens in CI. Its type-aware rules are worth calling out because they delegate to **tsgo**, the Go compiler behind TypeScript 7, so its type semantics match `tsc` exactly rather than approximating them.

**Biome** is the "one tool, one config" play: it replaces ESLint *and* Prettier, which is a real simplification for a greenfield project or a small team. The trade-off is honest — its type-aware rules approximate type information rather than running the compiler, so coverage thins on heavily generic code, and the plugin ecosystem is much smaller.

So the decision:

- **Existing codebase with plugins and custom rules** → keep ESLint 10, add oxlint as a fast pre-check. Lowest risk, most of the speed benefit.
- **Greenfield, small team, values simplicity** → Biome, and accept less rule coverage.
- **Anything relying on jsx-a11y, custom rules, or unusual generic-heavy TypeScript** → ESLint, and don't fight it.

The pattern worth naming out loud: the fast tool almost always has fewer plugins and less battle-tested edge-case handling, so adding it *in front of* the mature tool captures most of the benefit at none of the risk. That is the same reasoning that applies to Rolldown, Turbopack and tsgo — every layer of the pipeline got a native rewrite, and the sensible adoption path is incremental.
