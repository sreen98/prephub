/**
 * Visitor statistics: Cloudflare Web Analytics, which sets no cookies and stores
 * nothing on the device, so it needs no consent banner under EU/UK rules. Google
 * Analytics was removed in v1.7.31 because it set cookies before any consent.
 *
 * The token comes from the Cloudflare dashboard (Analytics & Logs → Web
 * Analytics → the site → manual JS snippet). It is public by design: it is in
 * the page for every visitor. Empty means no analytics at all, and the privacy
 * page says so (LegalPage reads ANALYTICS_ENABLED), so the two can never disagree.
 *
 * This is the token of the "sreenathp.com" Web Analytics site; PrepHub's visits
 * appear there under Host = prephub.sreenathp.com.
 */
export const CLOUDFLARE_BEACON_TOKEN: string = 'ce6d44a14e16413ca6cedc4518591986';

export const ANALYTICS_ENABLED = CLOUDFLARE_BEACON_TOKEN !== '';

/** Add the beacon once, in production builds only (local development is not counted). */
export function startAnalytics(): void {
  if (!ANALYTICS_ENABLED || import.meta.env.DEV || typeof document === 'undefined') return;
  if (document.querySelector('script[data-cf-beacon]')) return;
  const script = document.createElement('script');
  // As in Cloudflare's own snippet; a module script never blocks parsing.
  script.type = 'module';
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  // spa: true counts client-side route changes as page views.
  script.setAttribute('data-cf-beacon', JSON.stringify({ token: CLOUDFLARE_BEACON_TOKEN, spa: true }));
  document.head.appendChild(script);
}
