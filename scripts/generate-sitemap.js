/**
 * Generates sitemap.xml from the app's route data.
 * Run after build: node scripts/generate-sitemap.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://sreen98.github.io/interview-prep';
const DIST_DIR = path.resolve(__dirname, '../dist');

// Static routes
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/quiz', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground', priority: '0.7', changefreq: 'monthly' },
  { path: '/interview', priority: '0.8', changefreq: 'monthly' },
  { path: '/review', priority: '0.6', changefreq: 'monthly' },
  { path: '/bookmarks', priority: '0.5', changefreq: 'monthly' },
  { path: '/cheatsheets', priority: '0.8', changefreq: 'weekly' },
  { path: '/changelog', priority: '0.4', changefreq: 'weekly' },
];

// Read data.ts to extract routes from menuStructure and cheatSheets
const dataFile = fs.readFileSync(path.resolve(__dirname, '../src/data.ts'), 'utf-8');

function extractPaths(source) {
  const paths = [];
  const pathRegex = /path:\s*'([^']+)'/g;
  let match;
  while ((match = pathRegex.exec(source)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}

const allContentPaths = extractPaths(dataFile);
const today = new Date().toISOString().split('T')[0];

const urls = [
  ...staticRoutes.map(r => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
  ...allContentPaths
    .filter(p => !staticRoutes.some(s => s.path === p))
    .map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap generated with ${urls.length} URLs → dist/sitemap.xml`);
