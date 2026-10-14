import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Writes dist/licenses.txt: every npm package that ends up in the built site
 * (eager or lazy chunks), with its licence text. MIT, Apache-2.0 and similar
 * licences ask for their notice to travel with the code, and minification
 * strips the comments that carried it. Linked from the Terms page.
 */
function thirdPartyLicenses() {
  return {
    name: 'third-party-licenses',
    apply: 'build',
    generateBundle(_options, bundle) {
      // Only modules that actually render into a chunk: tree-shaken packages (Firebase
      // when sign-in is off) ship nothing, so they owe no notice.
      const shipped = Object.values(bundle)
        .filter((out) => out.type === 'chunk')
        .flatMap((chunk) => Object.entries(chunk.modules).filter(([, m]) => m.renderedLength > 0).map(([id]) => id))
      const dirs = new Set()
      for (const id of shipped) {
        // The LAST node_modules segment is the package that owns the file (nested installs).
        const matches = [...id.matchAll(/[\\/]node_modules[\\/](?:@[^\\/]+[\\/])?[^\\/]+/g)]
        const last = matches[matches.length - 1]
        if (last) dirs.add(id.slice(0, last.index + last[0].length).replace(/^\0/, ''))
      }
      const entries = []
      for (const dir of dirs) {
        let pkg
        try { pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) } catch { continue }
        const file = readdirSync(dir).find((f) => /^(licen[cs]e|copying)/i.test(f))
        const text = file ? readFileSync(join(dir, file), 'utf8').replace(/\r\n/g, '\n').trim() : `License: ${pkg.license ?? 'see package'}`
        entries.push({ name: `${pkg.name}@${pkg.version}`, license: pkg.license ?? 'unknown', text })
      }
      entries.sort((a, b) => a.name.localeCompare(b.name))
      const unique = entries.filter((e, i) => i === 0 || e.name !== entries[i - 1].name)
      const source = [
        'PrepHub includes the following open-source software. Thank you to their authors.',
        '',
        ...unique.map((e) => `${'='.repeat(72)}\n${e.name} (${e.license})\n${'='.repeat(72)}\n${e.text}\n`),
      ].join('\n')
      this.emitFile({ type: 'asset', fileName: 'licenses.txt', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    thirdPartyLicenses(),
    VitePWA({
      registerType: 'autoUpdate',
      // We register the worker ourselves in src/pwa.ts so we can poll for
      // updates and reload when a new build takes over. The auto-injected
      // registerSW.js does neither, which is why releases needed a hard reload.
      injectRegister: null,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PrepHub: Interview Prep',
        short_name: 'PrepHub',
        description: 'Comprehensive interview preparation guides for full-stack development',
        theme_color: '#0f766e',
        background_color: '#0a0a09',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'PrepHub desktop view with study guides and sidebar navigation',
          },
          {
            src: 'screenshots/mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'PrepHub mobile view with interview prep content',
          },
        ],
        categories: ['education', 'productivity'],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // Precache the SHELL only. Before content was lazy-loaded this glob
        // swept up all 68 guides and the service worker precached ~14.5 MB on
        // first visit — every visitor paying for every guide up front.
        // Guide chunks and the heavy lazy libraries are runtime-cached instead
        // (see the rules below), so they're stored the first time they're
        // actually opened and are available offline from then on.
        globPatterns: ['**/*.{css,html,ico,png,svg,woff2,webmanifest}', 'assets/app-*.js', 'assets/vendor-*.js'],
        // og-image is a social-preview asset fetched by crawlers, never by the
        // app — 722 KB of precache for nothing. Screenshots are only used by
        // the OS install prompt, which fetches them on demand.
        globIgnores: ['og-image.png', 'screenshots/**'],
        // Opening /licenses.txt (linked from the Terms) must fetch the file, not get the app shell.
        navigateFallbackDenylist: [/^\/licenses\.txt$/],
        runtimeCaching: [
          {
            // Lazily-loaded JS: guide content, the playground, Babel, Mermaid.
            // CacheFirst because every filename is content-hashed, so a given
            // URL is immutable — a new build produces a new name.
            // Monaco's icon font (codicon .ttf) is cached here too, so the editor's icons work offline.
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/') && /\.(js|ttf)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-chunks',
              expiration: { maxEntries: 250, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // Vendor splitting: long-lived dependencies live in their own
        // chunks so they stay cached across deploys (only the app chunk
        // hash changes when you ship feature work).
        // Prefixed `vendor-` deliberately: the service-worker precache glob
        // needs to match these and NOT the content chunks, and a bare `react`
        // key produced `react-<hash>.js` which a `react-*` glob could not tell
        // apart from `react-guide-<hash>.js` — that mistake precached the
        // 281 KB React guide as if it were a vendor library.
        // The app entry is named `app-<hash>.js` rather than Vite's default
        // `index-<hash>.js` for exactly the same reason the vendor chunks are
        // prefixed: the precache glob has to be able to name it. PGlite's
        // internal modules are also called `index.js`, so they emitted as
        // `index-<hash>.js` too and `assets/index-*.js` swept 627 KB of
        // WASM-loader code into the precache. Same mistake as `react-*`
        // matching `react-guide-*`, one package later.
        entryFileNames: 'assets/app-[hash].js',
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-markdown': ['react-markdown', 'remark-gfm', 'rehype-highlight'],
        },
      },
    },
  },
})
