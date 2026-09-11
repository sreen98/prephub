import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // We register the worker ourselves in src/pwa.ts so we can poll for
      // updates and reload when a new build takes over. The auto-injected
      // registerSW.js does neither, which is why releases needed a hard reload.
      injectRegister: null,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PrepHub — Interview Prep',
        short_name: 'PrepHub',
        description: 'Comprehensive interview preparation guides for full-stack development',
        theme_color: '#6366f1',
        background_color: '#0a0a0f',
        display: 'standalone',
        scope: '/prephub/',
        start_url: '/prephub/',
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
        runtimeCaching: [
          {
            // Lazily-loaded JS: guide content, the playground, Babel, Mermaid.
            // CacheFirst because every filename is content-hashed, so a given
            // URL is immutable — a new build produces a new name.
            urlPattern: ({ url }) => url.pathname.startsWith('/prephub/assets/') && url.pathname.endsWith('.js'),
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
  base: '/prephub/',
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
