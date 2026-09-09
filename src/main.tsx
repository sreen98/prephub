import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
// Registers the service worker and reloads the page when a new build is live.
import './pwa'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename="/prephub/">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
