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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        runtimeCaching: [
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
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-highlight'],
        },
      },
    },
  },
})
