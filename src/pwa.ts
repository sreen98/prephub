/**
 * Service-worker registration and update handling.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `vite-plugin-pwa` auto-injects a `registerSW.js` that is literally one bare
 * `navigator.serviceWorker.register(...)` call. That registers the worker but
 * wires up *nothing* else — so although the generated `sw.js` uses
 * `skipWaiting` + `clientsClaim` and a new worker takes over immediately, the
 * page carries on executing the JS bundle it already loaded. A release only
 * appeared after a manual reload.
 *
 * Calling `registerSW()` from the virtual module instead is what fixes it:
 * in `autoUpdate` mode the plugin registers through `workbox-window` and adds
 *
 *     wb.addEventListener('activated', e => {
 *       if (e.isUpdate || e.isExternal) window.location.reload()
 *     })
 *
 * so the page reloads itself once the new worker activates. Note that in this
 * mode `onNeedRefresh` is never invoked and `updateSW(true)` is a no-op — both
 * belong to the `prompt` registerType — so don't add them here expecting them
 * to run.
 *
 * Two related wrinkles this also addresses:
 *   - Navigations are served from the precached `index.html` (`NavigationRoute`
 *     + `createHandlerBoundToURL`), so before the new worker activates even a
 *     soft reload returns the previous deploy's HTML — which is why a *hard*
 *     reload was needed.
 *   - The worker was only checked for updates on page load, so a long-lived
 *     tab never noticed a deploy. Hence the polling below.
 */
import { registerSW } from 'virtual:pwa-register';

// How often to re-check sw.js while the tab is open.
const UPDATE_INTERVAL_MS = 60_000;

registerSW({
  immediate: true,

  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    const check = () => {
      // update() would only fail while offline.
      if (!navigator.onLine) return;
      void registration.update();
    };

    // Periodic check, so an open tab picks up a deploy without navigating.
    setInterval(check, UPDATE_INTERVAL_MS);

    // And on tab focus — the common case is a laptop reopened after a release.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  },

  onRegisterError(error) {
    console.error('[pwa] service worker registration failed', error);
  },
});
