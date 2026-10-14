import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import LegalPage from './LegalPage';
import { ANALYTICS_ENABLED } from '../lib/analytics';

const render = (doc: 'privacy' | 'terms') =>
  renderToStaticMarkup(<MemoryRouter><LegalPage doc={doc} /></MemoryRouter>);

describe('no consent-requiring tracking ships', () => {
  // Google Analytics set cookies before any consent, which EU/UK rules forbid.
  // It was removed in v1.7.31; cookieless Cloudflare Web Analytics replaced it.
  it('index.html loads no Google Analytics or Tag Manager', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).not.toMatch(/googletagmanager|google-analytics|gtag\(/);
  });
});

describe('Privacy Policy', () => {
  const html = render('privacy');

  it('names the controller and a contact email (GDPR Art. 13)', () => {
    expect(html).toContain('Who is responsible');
    expect(html).toMatch(/mailto:[^"]+@/);
  });

  it('covers legal bases, transfers, rights, children, Do Not Track and a date', () => {
    for (const heading of ['Legal bases (EU and UK)', 'Where data is processed', 'Your rights', 'Children', 'Do Not Track']) {
      expect(html, heading).toContain(heading);
    }
    expect(html).toMatch(/Last updated \d{1,2} \w+ \d{4}/);
  });

  it("names India's and Brazil's authorities and a grievance contact (DPDP Act, LGPD)", () => {
    expect(html).toContain('Data Protection Board of India');
    expect(html).toContain('ANPD');
    expect(html).toContain('grievances');
  });

  it('describes visitor statistics exactly as the build does them', () => {
    if (ANALYTICS_ENABLED) expect(html).toContain('Cloudflare Web Analytics');
    else expect(html).toContain('does not use analytics or any other tracking');
    expect(html).not.toContain('Google Analytics');
  });
});

describe('Terms of Use', () => {
  it('names who runs the site and how to reach them', () => {
    const html = render('terms');
    expect(html).toContain('Sreenath P');
    expect(html).toMatch(/mailto:[^"]+@/);
  });

  it('links the open-source licence notices that the build writes (vite.config.js thirdPartyLicenses)', () => {
    expect(render('terms')).toContain('href="/licenses.txt"');
    expect(readFileSync('vite.config.js', 'utf8')).toMatch(/thirdPartyLicenses\(\),/);
  });
});
