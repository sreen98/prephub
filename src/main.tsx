import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.jsx'
import { applyGuideSplitMigration, movedAnchorUrl } from './lib/guideSplitMigration'
// Registers the service worker and reloads the page when a new build is live.
import './pwa'

// React (v1.7.14), JavaScript and TypeScript (v1.7.15) were split into guide series. Move saved
// review history, bookmarks and checkpoints to the new question ids and pages, and send an old
// deep link to a moved section to its new page. Both are idempotent and run before the router
// reads the URL.
applyGuideSplitMigration();
const movedTo = movedAnchorUrl(window.location.pathname, window.location.hash);
if (movedTo) window.history.replaceState(null, '', movedTo);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    {/* One source of truth for the base path: `base` in vite.config.js */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Honour the OS "reduce motion" setting: movement is dropped, fades stay. */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
